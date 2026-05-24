import { FormEvent, useState } from "react";
import { FiLock, FiLogIn, FiPlusCircle, FiX } from "react-icons/fi";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { AuthMode } from "../types";

export function AuthModal() {
  const { authMode, lang, t, setAuthMode, completeAuth } = useApp();
  const [name, setName] = useState(lang === "ar" ? "مدير الحبشي" : "El Habashy Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!authMode) return null;
  const isLogin = authMode === "login";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    completeAuth(authMode, name || (isLogin ? t.adminLogin : t.customerSignup));
  };

  const modeButton = (mode: AuthMode, label: string) => {
    const Icon = mode === "login" ? FiLogIn : FiPlusCircle;
    return (
      <button
        type="button"
        onClick={() => setAuthMode(mode)}
        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-black transition ${
          authMode === mode ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
        }`}
      >
        <Icon />
        {label}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="grid max-h-[94vh] w-full max-w-4xl animate-scale-in overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="hidden bg-slate-950 p-7 text-white lg:grid">
          <Brand />
          <div className="mt-auto">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-amber-200">
              <FiLock />
              {isLogin ? t.adminLogin : t.customerSignup}
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight">
              {isLogin ? t.adminLogin : t.customerSignup}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{t.authHint}</p>
          </div>
        </aside>

        <section className="max-h-[94vh] overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-4">
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="hidden lg:block">
              <span className="text-xs font-black uppercase text-amber-700">
                {isLogin ? t.adminLogin : t.customerSignup}
              </span>
              <h2 className="mt-1 text-xl font-black">{isLogin ? t.login : t.signup}</h2>
            </div>
            <button
              type="button"
              onClick={() => setAuthMode(null)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-stone-100"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-5 p-5">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
              {modeButton("login", t.login)}
              {modeButton("signup", t.signup)}
            </div>

            <div className="rounded-lg border border-slate-200 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <FiLock className="mt-1 shrink-0 text-amber-600" />
                <p className="text-sm font-bold leading-7 text-slate-600">{t.authHint}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {!isLogin ? (
                <label className="grid gap-2 text-sm font-black text-slate-600">
                  {t.fullName}
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
                  />
                </label>
              ) : null}
              <label className="grid gap-2 text-sm font-black text-slate-600">
                {t.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@elhabashy.com"
                  className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-600">
                {t.password}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
                />
              </label>
            </div>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 hover:bg-amber-300"
            >
              {isLogin ? <FiLogIn /> : <FiPlusCircle />}
              {t.continue}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
