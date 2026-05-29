import { FiGlobe, FiHeart, FiLogIn, FiMenu, FiUserPlus, FiX } from "react-icons/fi";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";

export function Header() {
  const {
    lang,
    page,
    mobileOpen,
    currentUser,
    t,
    setLang,
    navigate,
    setMobileOpen,
  } = useApp();

  const navItems: Array<{ id: Page; label: string }> = [
    { id: "home", label: t.home },
    { id: "listings", label: t.listings },
    { id: "dashboard", label: t.dashboard },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm shadow-slate-950/5 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <button type="button" onClick={() => navigate("home")} className="text-start">
          <Brand />
        </button>

        <nav
          className={`${
            mobileOpen ? "grid" : "hidden"
          } absolute inset-x-4 top-[78px] gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/15 lg:static lg:flex lg:items-center lg:rounded-full lg:border-slate-200/80 lg:bg-slate-100/80 lg:p-1 lg:shadow-none`}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`min-h-11 rounded-full px-5 text-sm font-black transition duration-300 ${
                page === item.id
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 lg:hidden">
            <AuthButtons />
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 md:inline-flex">
              <FiHeart />
              {currentUser.favorites.length}
            </span>
          ) : null}
          <div className="hidden items-center gap-2 md:flex">
            <AuthButtons />
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
          >
            <FiGlobe />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function AuthButtons() {
  const { currentUser, t, navigate } = useApp();

  if (currentUser) {
    return (
      <button
        type="button"
        onClick={() => navigate("dashboard")}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 shadow-sm"
      >
        {currentUser.name}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("login")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-amber-300"
      >
        <FiLogIn />
        {t.login}
      </button>
      <button
        type="button"
        onClick={() => navigate("register")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        <FiUserPlus />
        {t.register}
      </button>
    </>
  );
}
