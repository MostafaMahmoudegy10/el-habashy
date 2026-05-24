import {
  FiBarChart2,
  FiGlobe,
  FiHome,
  FiLogIn,
  FiMenu,
  FiPlusCircle,
  FiX,
} from "react-icons/fi";
import { TbLayoutDashboard, TbScale } from "react-icons/tb";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";

const navIcons = {
  home: FiHome,
  listings: FiBarChart2,
  about: TbScale,
  compare: TbScale,
  dashboard: TbLayoutDashboard,
};

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
    setAuthMode,
  } = useApp();

  const navItems: Array<{ id: Page; label: string }> = [
    { id: "home", label: t.home },
    { id: "listings", label: t.listings },
    { id: "about", label: t.about },
    { id: "compare", label: t.compare },
    { id: "dashboard", label: t.dashboard },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <button type="button" onClick={() => navigate("home")} className="text-start">
          <Brand />
        </button>

        <nav
          className={`${
            mobileOpen ? "grid" : "hidden"
          } absolute inset-x-4 top-[76px] gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-soft lg:static lg:flex lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {navItems.map((item) => {
            const Icon = navIcons[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-extrabold transition ${
                  page === item.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-stone-100 hover:text-slate-950"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}

          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 lg:hidden">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700"
              >
                <FiLogIn />
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 text-sm font-black text-slate-950"
              >
                <FiPlusCircle />
                {t.signup}
              </button>
            </div>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="hidden h-11 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-black text-emerald-700 md:flex">
              {currentUser.name}
            </span>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm hover:border-amber-300"
              >
                <FiLogIn />
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white shadow-sm hover:bg-slate-800"
              >
                <FiPlusCircle />
                {t.signup}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm hover:border-amber-300"
          >
            <FiGlobe />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
