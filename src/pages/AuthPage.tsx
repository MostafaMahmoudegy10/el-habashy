import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLoader,
  FiLock,
  FiLogIn,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import authImage from "../assets/auth-property.webp";
import { Brand } from "../components/Brand";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { authApi } from "../lib/authApi";

type Screen = "form" | "registered" | "forgot" | "otp" | "reset-done";
type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

const emptyFields: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
};

const panelMotion = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(6px)" },
};

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { lang, navigate, setToast } = useApp();
  const { login } = useAuth();
  const [fields, setFields] = useState(emptyFields);
  const [screen, setScreen] = useState<Screen>("form");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);
  const isRegister = mode === "register";
  const isAr = lang === "ar";
  const text = (ar: string, en: string) => (isAr ? ar : en);

  useEffect(() => {
    setScreen("form");
    setRegisterStep(1);
    setError("");
    setFieldErrors({});
  }, [mode]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const passwordScore = useMemo(() => {
    const value = fields.password;
    return [value.length >= 8, /[a-z]/i.test(value) && /\d/.test(value), /[^\w]/.test(value)].filter(Boolean).length;
  }, [fields.password]);

  const updateField = (key: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setError("");
  };

  const validateIdentity = () => {
    const next: Record<string, string> = {};
    if (!fields.firstName.trim()) next.firstName = text("اكتب اسمك الأول", "Enter your first name");
    if (!fields.lastName.trim()) next.lastName = text("اكتب اسم العائلة", "Enter your last name");
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) next.email = text("أدخل بريدًا إلكترونيًا صحيحًا", "Enter a valid email address");
    setFieldErrors(next);
    return !Object.keys(next).length;
  };

  const validatePassword = (includeConfirmation: boolean) => {
    const next: Record<string, string> = {};
    if (fields.password.length < 8 || fields.password.length > 72) {
      next.password = text("كلمة المرور يجب أن تكون من 8 إلى 72 حرفًا", "Password must be 8–72 characters");
    }
    if (includeConfirmation && fields.password !== fields.confirmPassword) {
      next.confirmPassword = text("كلمتا المرور غير متطابقتين", "Passwords do not match");
    }
    setFieldErrors(next);
    return !Object.keys(next).length;
  };

  const explainError = (caught: unknown) => {
    if (caught instanceof ApiError) {
      setFieldErrors(caught.errors);
      if (caught.status === 0) return text("تعذر الوصول إلى الخادم. بياناتك ما زالت موجودة، حاول مرة أخرى.", "We couldn't reach the server. Your details are still here—try again.");
      if (caught.status === 401) return text("البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Incorrect email or password.");
      if (caught.status === 403) return text("الحساب غير مفعّل. راجع بريدك أو أعد إرسال رابط التفعيل.", "Your account isn't active yet. Check your inbox or resend the link.");
      if (caught.status === 409) return text("هذا البريد مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.", "This email is already registered. Try signing in.");
      return caught.message;
    }
    return text("حدث خطأ غير متوقع. حاول مرة أخرى.", "Something went wrong. Please try again.");
  };

  const continueRegistration = () => {
    if (!validateIdentity()) return;
    setRegisterStep(2);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (isRegister && registerStep === 1) {
      continueRegistration();
      return;
    }
    if (isRegister ? !validatePassword(true) : !/^\S+@\S+\.\S+$/.test(fields.email) || !validatePassword(false)) {
      if (!isRegister && !/^\S+@\S+\.\S+$/.test(fields.email)) {
        setFieldErrors((current) => ({ ...current, email: text("أدخل بريدًا إلكترونيًا صحيحًا", "Enter a valid email address") }));
      }
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (isRegister) {
        const result = await authApi.register({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          password: fields.password,
        });
        updateField("email", result.email);
        setScreen("registered");
        setCooldown(60);
      } else {
        const result = await login(fields.email.trim(), fields.password);
        setToast(text(`أهلًا ${result.user.firstName}، سعداء بعودتك`, `Welcome back, ${result.user.firstName}`));
        navigate(result.user.role === "ADMIN" ? "dashboard" : "home");
      }
    } catch (caught) {
      setError(explainError(caught));
    } finally {
      setBusy(false);
    }
  };

  const resend = async (kind: "activation" | "otp") => {
    if (busy || cooldown) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "activation") await authApi.resendActivation(fields.email);
      else await authApi.forgotPassword(fields.email);
      setCooldown(60);
      setToast(text("إن كان الحساب صالحًا ستصلك الرسالة خلال دقائق.", "If eligible, the email will arrive shortly."));
    } catch (caught) {
      setError(explainError(caught));
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) {
      setFieldErrors({ email: text("أدخل بريدًا صحيحًا", "Enter a valid email") });
      return;
    }
    setBusy(true);
    setError("");
    try {
      await authApi.forgotPassword(fields.email);
      updateField("password", "");
      updateField("confirmPassword", "");
      setScreen("otp");
      setCooldown(60);
    } catch (caught) {
      setError(explainError(caught));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\d{6}$/.test(fields.otp)) next.otp = text("الرمز مكوّن من 6 أرقام", "Enter the 6-digit code");
    if (fields.password.length < 8 || fields.password.length > 72) next.password = text("كلمة المرور من 8 إلى 72 حرفًا", "Password must be 8–72 characters");
    if (fields.password !== fields.confirmPassword) next.confirmPassword = text("كلمتا المرور غير متطابقتين", "Passwords do not match");
    if (Object.keys(next).length) {
      setFieldErrors(next);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await authApi.resetPassword({ email: fields.email, otp: fields.otp, newPassword: fields.password });
      setScreen("reset-done");
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401 ? text("رمز التحقق غير صحيح أو انتهت صلاحيته.", "The verification code is invalid or expired.") : explainError(caught));
    } finally {
      setBusy(false);
    }
  };

  const pageKey = `${mode}-${screen}-${isRegister ? registerStep : 0}`;

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <section className="relative isolate min-h-[calc(100vh-84px)] overflow-hidden bg-[#f5f2eb] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="pointer-events-none absolute inset-0 auth-paper" />

        <motion.div
          layout
          className="relative mx-auto grid min-h-[700px] w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_34px_100px_-44px_rgba(15,23,42,.55)] lg:grid-cols-[1.02fr_.98fr]"
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <VisualPanel mode={mode} isAr={isAr} />

          <div className="relative flex min-h-[610px] flex-col px-5 py-6 sm:px-10 sm:py-9 lg:min-h-[700px] lg:px-14 lg:py-11">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <Brand />
              <button type="button" onClick={() => navigate("home")} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600" aria-label={text("العودة للرئيسية", "Back home")}>
                {isAr ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            </div>

            {screen === "form" && (
              <AuthSwitcher mode={mode} isAr={isAr} onChange={(nextMode) => navigate(nextMode)} />
            )}

            <div className="my-auto py-8 lg:py-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={pageKey} {...panelMotion} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
                  {screen === "registered" ? (
                    <SuccessPanel
                      title={text("فعّل حسابك من بريدك", "Activate your account")}
                      eyebrow={text("تم إنشاء الحساب", "ACCOUNT CREATED")}
                      description={text("أرسلنا رابط التفعيل إلى", "We sent your activation link to")}
                      email={fields.email}
                      primary={cooldown ? `${text("إعادة الإرسال بعد", "Resend in")} ${cooldown}s` : text("إعادة إرسال رابط التفعيل", "Resend activation link")}
                      onPrimary={() => resend("activation")}
                      primaryDisabled={!!cooldown || busy}
                      secondary={text("العودة لتسجيل الدخول", "Back to sign in")}
                      onSecondary={() => navigate("login")}
                    />
                  ) : screen === "reset-done" ? (
                    <SuccessPanel
                      title={text("كلمة مرور جديدة، بداية آمنة", "Your new password is ready")}
                      eyebrow={text("تم التحديث بنجاح", "PASSWORD UPDATED")}
                      description={text("يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.", "You can now sign in with your new password.")}
                      primary={text("تسجيل الدخول", "Sign in now")}
                      onPrimary={() => navigate("login")}
                    />
                  ) : screen === "forgot" ? (
                    <FlowForm
                      eyebrow={text("استعادة الحساب", "ACCOUNT RECOVERY")}
                      title={text("نسيت كلمة المرور؟", "Forgot your password?")}
                      hint={text("أدخل بريدك. إذا كان الحساب نشطًا، سنرسل رمز تحقق من 6 أرقام.", "Enter your email. If the account is active, we'll send a 6-digit code.")}
                      onSubmit={requestOtp}
                      onBack={() => setScreen("form")}
                      error={error}
                      isAr={isAr}
                    >
                      <Field icon={FiMail} label={text("البريد الإلكتروني", "Email address")} value={fields.email} onChange={(value) => updateField("email", value)} type="email" autoComplete="email" error={fieldErrors.email} />
                      <PrimaryButton busy={busy} isAr={isAr} label={text("إرسال رمز التحقق", "Send verification code")} icon={FiMail} />
                    </FlowForm>
                  ) : screen === "otp" ? (
                    <FlowForm
                      eyebrow={text("خطوة التحقق", "VERIFY YOUR IDENTITY")}
                      title={text("راجع صندوق الوارد", "Check your inbox")}
                      hint={text(`أدخل الرمز المرسل إلى ${fields.email}`, `Enter the code sent to ${fields.email}`)}
                      onSubmit={resetPassword}
                      onBack={() => setScreen("forgot")}
                      error={error}
                      isAr={isAr}
                    >
                      <OtpField label={text("رمز التحقق", "Verification code")} value={fields.otp} onChange={(value) => updateField("otp", value)} error={fieldErrors.otp} />
                      <Field icon={FiLock} label={text("كلمة المرور الجديدة", "New password")} value={fields.password} onChange={(value) => updateField("password", value)} type="password" autoComplete="new-password" error={fieldErrors.password} />
                      <Field icon={FiLock} label={text("تأكيد كلمة المرور", "Confirm password")} value={fields.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} type="password" autoComplete="new-password" error={fieldErrors.confirmPassword} />
                      <div className="flex items-center justify-between gap-3">
                        <button type="button" disabled={!!cooldown || busy} onClick={() => resend("otp")} className="text-xs font-extrabold text-amber-700 transition hover:text-amber-900 disabled:text-slate-400">
                          {cooldown ? `${text("إرسال جديد بعد", "Resend in")} ${cooldown}s` : text("إعادة إرسال الرمز", "Resend code")}
                        </button>
                        <span className="text-xs font-bold text-slate-400" dir="ltr">{fields.email}</span>
                      </div>
                      <PrimaryButton busy={busy} isAr={isAr} label={text("حفظ كلمة المرور", "Save new password")} icon={FiShield} />
                    </FlowForm>
                  ) : (
                    <form onSubmit={submit} noValidate className="grid gap-5">
                      <FormHeading mode={mode} step={registerStep} isAr={isAr} />

                      <AnimatePresence mode="wait" initial={false}>
                        {!isRegister ? (
                          <motion.div key="login-fields" {...panelMotion} className="grid gap-4">
                            <Field icon={FiMail} label={text("البريد الإلكتروني", "Email address")} value={fields.email} onChange={(value) => updateField("email", value)} type="email" autoComplete="email" error={fieldErrors.email} />
                            <Field
                              icon={FiLock}
                              label={text("كلمة المرور", "Password")}
                              value={fields.password}
                              onChange={(value) => updateField("password", value)}
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              error={fieldErrors.password}
                              action={<PasswordToggle visible={showPassword} onClick={() => setShowPassword((value) => !value)} />}
                            />
                            <button
                              type="button"
                              onClick={() => { updateField("password", ""); setScreen("forgot"); }}
                              className="w-fit justify-self-end text-sm font-extrabold text-slate-600 transition hover:text-amber-700"
                            >
                              {text("نسيت كلمة المرور؟", "Forgot password?")}
                            </button>
                          </motion.div>
                        ) : registerStep === 1 ? (
                          <motion.div key="register-identity" {...panelMotion} className="grid gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field icon={FiUser} label={text("الاسم الأول", "First name")} value={fields.firstName} onChange={(value) => updateField("firstName", value)} autoComplete="given-name" error={fieldErrors.firstName} />
                              <Field icon={FiUser} label={text("اسم العائلة", "Last name")} value={fields.lastName} onChange={(value) => updateField("lastName", value)} autoComplete="family-name" error={fieldErrors.lastName} />
                            </div>
                            <Field icon={FiMail} label={text("البريد الإلكتروني", "Email address")} value={fields.email} onChange={(value) => updateField("email", value)} type="email" autoComplete="email" error={fieldErrors.email} />
                          </motion.div>
                        ) : (
                          <motion.div key="register-password" {...panelMotion} className="grid gap-4">
                            <button type="button" onClick={() => setRegisterStep(1)} className="flex w-fit items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-slate-950">
                              {isAr ? <FiChevronRight /> : <FiChevronLeft />}
                              {text("تعديل بيانات الحساب", "Edit account details")}
                            </button>
                            <Field
                              icon={FiLock}
                              label={text("اختر كلمة مرور", "Choose a password")}
                              value={fields.password}
                              onChange={(value) => updateField("password", value)}
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              error={fieldErrors.password}
                              action={<PasswordToggle visible={showPassword} onClick={() => setShowPassword((value) => !value)} />}
                            />
                            <PasswordStrength score={passwordScore} isAr={isAr} />
                            <Field icon={FiShield} label={text("تأكيد كلمة المرور", "Confirm password")} value={fields.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} type="password" autoComplete="new-password" error={fieldErrors.confirmPassword} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {error && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className="overflow-hidden">
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">
                              {error}
                              {!isRegister && error.includes("غير مفعّل") && (
                                <button type="button" onClick={() => resend("activation")} className="mt-1 block font-black underline underline-offset-4">
                                  {text("إعادة إرسال رابط التفعيل", "Resend activation link")}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <PrimaryButton
                        busy={busy}
                        isAr={isAr}
                        label={isRegister ? registerStep === 1 ? text("تابع لإنشاء كلمة المرور", "Continue to password") : text("إنشاء حسابي", "Create my account") : text("تسجيل الدخول", "Sign in")}
                        icon={isRegister && registerStep === 1 ? (isAr ? FiArrowLeft : FiArrowRight) : FiLogIn}
                      />

                      <div className="flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-400">
                        <FiShield className="shrink-0 text-amber-600" />
                        <span>{text("جلسة مشفّرة، والتوكن لا يُخزّن على جهازك", "Encrypted session—your token is never stored on your device")}</span>
                      </div>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="border-t border-slate-100 pt-5 text-center text-[11px] font-bold text-slate-400">
              {text("باستمرارك أنت توافق على شروط الاستخدام وسياسة الخصوصية", "By continuing, you agree to our terms and privacy policy")}
            </p>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

function VisualPanel({ mode, isAr }: { mode: "login" | "register"; isAr: boolean }) {
  const isRegister = mode === "register";
  return (
    <aside className="relative h-56 overflow-hidden bg-slate-900 sm:h-64 lg:h-auto lg:min-h-[700px]">
      <motion.img
        src={authImage}
        alt={isAr ? "مكتب الحبشي لإدارة وتقييم الأصول" : "El Habashy asset management office"}
        className="absolute inset-0 h-full w-full object-cover object-center"
        initial={{ scale: 1.08 }}
        animate={{ scale: [1.04, 1.08, 1.04], x: isRegister ? -7 : 0 }}
        transition={{ scale: { duration: 16, repeat: Infinity, ease: "easeInOut" }, x: { duration: 0.7 } }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/5 via-transparent to-slate-950/85" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/45 to-transparent" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 lg:hidden">
        <span className="rounded-full border border-white/25 bg-slate-950/45 px-4 py-2 text-[10px] font-black tracking-[.16em] text-white backdrop-blur-md">EL HABASHY</span>
        <span className="max-w-56 text-end text-sm font-black leading-6 text-white">{isAr ? "قرارات أوثق. فرص أقرب." : "Better decisions. Closer opportunities."}</span>
      </motion.div>

      <div className="absolute inset-0 hidden flex-col p-9 lg:flex xl:p-11">
        <div className="flex items-center justify-between gap-4">
          <Brand inverted />
          <span className="rounded-full border border-white/25 bg-slate-950/25 px-4 py-2 text-[10px] font-black tracking-[.18em] text-white backdrop-blur-md">{isAr ? "بوابة العملاء" : "CLIENT ACCESS"}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} {...panelMotion} className="mt-auto max-w-[460px] text-white">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-amber-300" />
              <span className="text-xs font-black tracking-[.2em] text-amber-300">EL HABASHY</span>
            </div>
            <h1 className="text-4xl font-black leading-[1.22] xl:text-5xl">
              {isRegister
                ? isAr ? "كل فرصة عظيمة تبدأ بخطوة موثوقة." : "Every great opportunity starts with trust."
                : isAr ? "قراراتك المهمة تبدأ من هنا." : "Your important decisions start here."}
            </h1>
            <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-white/75">
              {isAr ? "بوابتك الآمنة لمتابعة الأصول والمزادات وخدمات التقييم والتحكيم في مكان واحد." : "Your secure gateway to assets, auctions, valuation and arbitration services in one place."}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {(isAr ? ["خصوصية", "أمان", "وضوح"] : ["Private", "Secure", "Clear"]).map((item, index) => (
                <motion.span key={item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + index * 0.08 }} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold backdrop-blur-md">
                  <FiCheck className="me-1.5 inline text-amber-300" />{item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function AuthSwitcher({ mode, isAr, onChange }: { mode: "login" | "register"; isAr: boolean; onChange: (mode: "login" | "register") => void }) {
  return (
    <div className="mx-auto grid w-full max-w-sm grid-cols-2 rounded-full border border-slate-200 bg-slate-50 p-1">
      {(["login", "register"] as const).map((item) => {
        const active = mode === item;
        return (
          <button key={item} type="button" onClick={() => onChange(item)} className={`relative isolate h-10 rounded-full text-xs font-black transition ${active ? "text-white" : "text-slate-500 hover:text-slate-900"}`}>
            {active && <motion.span layoutId="auth-active-tab" className="absolute inset-0 -z-10 rounded-full bg-slate-950 shadow-lg shadow-slate-950/15" />}
            {item === "login" ? (isAr ? "تسجيل الدخول" : "Sign in") : (isAr ? "حساب جديد" : "Create account")}
          </button>
        );
      })}
    </div>
  );
}

function FormHeading({ mode, step, isAr }: { mode: "login" | "register"; step: 1 | 2; isAr: boolean }) {
  const register = mode === "register";
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-black tracking-[.18em] text-amber-700">
          {register ? (isAr ? `إنشاء الحساب · ${step}/2` : `CREATE ACCOUNT · ${step}/2`) : (isAr ? "مرحبًا بعودتك" : "WELCOME BACK")}
        </span>
        {register && (
          <div className="flex w-20 gap-1.5">
            {[1, 2].map((number) => <motion.span key={number} animate={{ backgroundColor: step >= number ? "#d69e2e" : "#e2e8f0" }} className="h-1 flex-1 rounded-full" />)}
          </div>
        )}
      </div>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-[2.15rem]">
        {register ? step === 1 ? (isAr ? "خلّينا نتعرف عليك" : "Let's get to know you") : (isAr ? "أمّن حسابك" : "Secure your account") : (isAr ? "ادخل إلى حسابك" : "Sign in to your account")}
      </h2>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
        {register ? step === 1 ? (isAr ? "ثلاث بيانات بسيطة للبدء." : "Just three simple details to begin.") : (isAr ? "اختر كلمة مرور قوية، وبعدها فعّل بريدك." : "Choose a strong password, then activate your email.") : (isAr ? "كل ما يهمك محفوظ في مكان واحد." : "Everything that matters is waiting in one place.")}
      </p>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text", autoComplete, error, action }: { icon: typeof FiUser; label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; error?: string; action?: ReactNode }) {
  const fieldId = `auth-${label.replace(/\s+/g, "-")}`;
  return (
    <label htmlFor={fieldId} className="grid gap-2 text-sm font-extrabold text-slate-700">
      <span>{label}</span>
      <span className="group relative block">
        <Icon className={`pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-lg transition ${error ? "text-rose-400" : "text-slate-400 group-focus-within:text-amber-600"}`} />
        <input id={fieldId} value={value} onChange={(event) => onChange(event.target.value)} type={type} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} className={`auth-input h-14 w-full rounded-2xl border bg-white ps-11 pe-12 text-sm font-bold text-slate-950 outline-none transition duration-300 placeholder:text-slate-300 ${error ? "border-rose-300 shadow-[0_0_0_3px_rgba(244,63,94,.06)]" : "border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(217,154,30,.1)]"}`} />
        {action && <span className="absolute end-4 top-1/2 -translate-y-1/2">{action}</span>}
      </span>
      <AnimatePresence initial={false}>
        {error && <motion.small id={`${fieldId}-error`} initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs font-bold text-rose-600">{error}</motion.small>}
      </AnimatePresence>
    </label>
  );
}

function PasswordToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800" aria-label={visible ? "Hide password" : "Show password"}>{visible ? <FiEyeOff /> : <FiEye />}</button>;
}

function PasswordStrength({ score, isAr }: { score: number; isAr: boolean }) {
  const labels = isAr ? ["ابدأ بكتابة كلمة المرور", "ضعيفة", "جيدة", "قوية"] : ["Start typing your password", "Weak", "Good", "Strong"];
  const colors = ["bg-slate-200", "bg-rose-400", "bg-amber-400", "bg-emerald-500"];
  return (
    <div className="-mt-1 grid gap-2">
      <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map((level) => <motion.span key={level} animate={{ scaleX: score >= level ? 1 : 0.92 }} className={`h-1 origin-start rounded-full transition-colors ${score >= level ? colors[score] : "bg-slate-200"}`} />)}</div>
      <span className="text-[11px] font-bold text-slate-400">{labels[score]}</span>
    </div>
  );
}

function OtpField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <label className="grid gap-3">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <span className="relative block" dir="ltr">
        <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" aria-invalid={!!error} className={`h-16 w-full rounded-2xl border bg-white px-14 text-center text-2xl font-black tracking-[.55em] outline-none transition ${error ? "border-rose-300" : "border-slate-200 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(217,154,30,.1)]"}`} />
      </span>
      {error && <small className="text-xs font-bold text-rose-600">{error}</small>}
    </label>
  );
}

function PrimaryButton({ busy, isAr, label, icon: Icon }: { busy: boolean; isAr: boolean; label: string; icon: typeof FiLogIn }) {
  return (
    <motion.button type="submit" disabled={busy} whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-[0_16px_35px_-16px_rgba(15,23,42,.8)] transition disabled:cursor-wait disabled:opacity-65">
      <span className="absolute inset-y-0 start-0 w-0 bg-amber-500 transition-all duration-500 group-hover:w-full" />
      <span className="relative">{busy ? (isAr ? "جاري الاتصال..." : "Connecting...") : label}</span>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-white/10">{busy ? <FiLoader className="animate-spin" /> : <Icon />}</span>
    </motion.button>
  );
}

function FlowForm({ eyebrow, title, hint, onSubmit, onBack, error, isAr, children }: { eyebrow: string; title: string; hint: string; onSubmit: (event: FormEvent) => void; onBack: () => void; error: string; isAr: boolean; children: ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <button type="button" onClick={onBack} className="flex w-fit items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-slate-950">{isAr ? <FiChevronRight /> : <FiChevronLeft />}{isAr ? "رجوع" : "Back"}</button>
      <div><p className="text-[11px] font-black tracking-[.18em] text-amber-700">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2><p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{hint}</p></div>
      {children}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
    </form>
  );
}

function SuccessPanel({ eyebrow, title, description, email, primary, onPrimary, primaryDisabled, secondary, onSecondary }: { eyebrow: string; title: string; description: string; email?: string; primary: string; onPrimary: () => void; primaryDisabled?: boolean; secondary?: string; onSecondary?: () => void }) {
  return (
    <div className="grid justify-items-center gap-5 py-4 text-center">
      <motion.div initial={{ scale: 0.65, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} className="relative grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-4xl text-emerald-600">
        <motion.span className="absolute inset-0 rounded-full border border-emerald-300" animate={{ scale: [1, 1.35], opacity: [0.55, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <FiCheck />
      </motion.div>
      <div><p className="text-[11px] font-black tracking-[.18em] text-amber-700">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2><p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{description}{email && <strong className="mt-1 block text-slate-900" dir="ltr">{email}</strong>}</p></div>
      <motion.button type="button" disabled={primaryDisabled} onClick={onPrimary} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl disabled:opacity-45"><FiRefreshCw />{primary}</motion.button>
      {secondary && onSecondary && <button type="button" onClick={onSecondary} className="text-sm font-extrabold text-amber-700 transition hover:text-amber-900">{secondary}</button>}
    </div>
  );
}
