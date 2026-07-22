import { FormEvent, useState } from "react";
import { FiLock, FiLogIn, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import { Brand } from "../components/Brand";
import { LazyImage } from "../components/LazyImage";
import { useApp } from "../context/AppContext";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { lang, t, completeAuth, navigate } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError(t.formRequired);
      return;
    }
    completeAuth(mode, { name, email });
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-170px)] max-w-7xl place-items-center px-4 py-12 lg:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
          <LazyImage
            eager
            src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1100&q=84"
            alt=""
            wrapperClassName="absolute inset-0 h-full w-full opacity-35"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(245,158,11,0.32),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="relative flex h-full flex-col">
            <Brand inverted />
            <div className="mt-auto">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
                {isRegister ? <FiUserPlus /> : <FiLock />}
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight">
                {isRegister ? t.registerTitle : t.authTitle}
              </h1>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">
                {isRegister ? t.registerHint : t.loginHint}
              </p>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="grid gap-5 p-5 sm:p-8 animate-fade-up">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-amber-700">
              {isRegister ? t.register : t.login}
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              {isRegister ? t.registerTitle : t.authTitle}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
              {isRegister ? t.registerHint : t.loginHint}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => navigate("login")}
              className={`h-11 rounded-full text-sm font-black ${
                !isRegister ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => navigate("register")}
              className={`h-11 rounded-full text-sm font-black ${
                isRegister ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
            >
              {t.register}
            </button>
          </div>

          {isRegister ? (
            <Field icon={FiUser} label={t.fullName} value={name} onChange={setName} />
          ) : null}
          <Field icon={FiMail} label={t.email} value={email} onChange={setEmail} type="email" />
          <Field icon={FiLock} label={t.password} value={password} onChange={setPassword} type="password" />

          {error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{error}</p> : null}

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-800"
          >
            {isRegister ? <FiUserPlus /> : <FiLogIn />}
            {t.continue}
          </button>

          <p className="text-center text-xs font-bold text-slate-500">
            {lang === "ar"
              ? "احفظ عروضك المفضلة وتابع التحديثات المناسبة لك."
              : lang === "fr"
                ? "Enregistrez vos offres favorites et suivez les mises a jour utiles."
                : "Save favorite listings and follow the updates that matter to you."}
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: typeof FiUser;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <span className="relative">
        <Icon className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 outline-none transition focus:border-amber-400 focus:bg-white"
        />
      </span>
    </label>
  );
}
