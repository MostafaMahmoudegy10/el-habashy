import { FiChevronDown, FiGlobe, FiHeart, FiLogIn, FiMenu, FiUserPlus, FiX } from "react-icons/fi";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import { categoryIcon } from "../lib/icons";
import type { AboutSection, Page } from "../types";

export function Header() {
  const {
    lang,
    page,
    mobileOpen,
    currentUser,
    sectors,
    services,
    t,
    setLang,
    navigate,
    navigateListings,
    navigateAbout,
    selectService,
    setMobileOpen,
  } = useApp();

  const navItems: Array<{ id: Page; label: string }> = [
    { id: "dashboard", label: t.dashboard },
  ];
  const arbitration = services.filter((item) => item.kind === "arbitration");
  const valuation = services.find((item) => item.kind === "valuation");
  const consulting = services.find((item) => item.kind === "consulting");
  const aboutItems: Array<{ id: AboutSection; label: string }> = [
    { id: "profile", label: t.aboutProfile },
    { id: "previous-work", label: t.previousWork },
    { id: "certificates", label: t.honorCertificates },
    { id: "structure", label: t.organizationStructure },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm shadow-slate-950/5 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 xl:px-6">
        <button type="button" onClick={() => navigate("home")} className="min-w-0 shrink text-start">
          <Brand />
        </button>

        <nav
          className={`${
            mobileOpen ? "grid" : "hidden"
          } absolute inset-x-3 top-[78px] max-h-[calc(100vh-96px)] gap-2 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/15 xl:static xl:flex xl:max-h-none xl:items-center xl:overflow-visible xl:rounded-full xl:border-slate-200/80 xl:bg-slate-100/80 xl:p-1 xl:shadow-none`}
        >
          <button
            type="button"
            onClick={() => navigate("home")}
            className={`min-h-11 rounded-full px-5 text-sm font-black transition duration-300 ${
              page === "home"
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                : "text-slate-600 hover:bg-white hover:text-slate-950"
            }`}
          >
            {t.home}
          </button>
          <div className="group relative">
            <button type="button" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-slate-600 transition hover:bg-white hover:text-slate-950 xl:w-auto">{lang === "ar" ? "قطاعات التحكيم" : "Arbitration sectors"}<FiChevronDown /></button>
            <div className="mt-2 grid gap-1 rounded-2xl bg-slate-50 p-2 xl:invisible xl:absolute xl:start-0 xl:top-full xl:z-50 xl:mt-3 xl:min-w-64 xl:translate-y-1 xl:border xl:border-slate-200 xl:bg-white xl:opacity-0 xl:shadow-2xl xl:transition xl:group-hover:visible xl:group-hover:translate-y-0 xl:group-hover:opacity-100 xl:group-focus-within:visible xl:group-focus-within:opacity-100">{arbitration.map((item) => <button key={item.id} type="button" onClick={() => selectService(item.id)} className="min-h-11 rounded-xl px-4 text-start text-sm font-black text-slate-600 hover:bg-amber-50 hover:text-slate-950">{item.title[lang]}</button>)}</div>
          </div>
          <button type="button" onClick={() => valuation && selectService(valuation.id)} className="min-h-11 rounded-full px-5 text-sm font-black text-slate-600 transition hover:bg-white hover:text-slate-950">{lang === "ar" ? "التقييمات" : "Valuation"}</button>
          <button type="button" onClick={() => consulting && selectService(consulting.id)} className="min-h-11 rounded-full px-5 text-sm font-black text-slate-600 transition hover:bg-white hover:text-slate-950">{lang === "ar" ? "الاستشارات" : "Consulting"}</button>
          <div className="group relative">
            <button
              type="button"
              onClick={() => navigateListings("all")}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition duration-300 lg:w-auto ${
                page === "listings"
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              {t.sectors}
              <FiChevronDown className="hidden lg:block" />
            </button>
            <div className="mt-2 grid gap-1 rounded-2xl bg-slate-50 p-2 lg:invisible lg:absolute lg:start-0 lg:top-full lg:z-50 lg:mt-3 lg:min-w-72 lg:translate-y-1 lg:border lg:border-slate-200 lg:bg-white lg:opacity-0 lg:shadow-2xl lg:transition lg:group-hover:visible lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:visible lg:group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => navigateListings("all")}
                className="min-h-10 rounded-xl px-4 text-start text-sm font-black text-slate-600 transition hover:bg-amber-50 hover:text-slate-950"
              >
                {t.allCategories}
              </button>
              {sectors.map((sector) => {
                const Icon = categoryIcon[sector.id];
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => navigateListings(sector.id)}
                    className="grid min-h-12 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 text-start transition hover:bg-amber-50"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-amber-300">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-black text-slate-800">{sector.title[lang]}</strong>
                      <small className="line-clamp-1 text-xs font-bold text-slate-500">{sector.description[lang]}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="group relative">
            <button
              type="button"
              onClick={() => navigateAbout("profile")}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition duration-300 xl:w-auto ${
                page === "about"
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              {t.about}
              <FiChevronDown className="hidden xl:block" />
            </button>
            <div className="mt-2 grid gap-1 rounded-2xl bg-slate-50 p-2 xl:absolute xl:start-0 xl:top-full xl:mt-3 xl:hidden xl:min-w-56 xl:border xl:border-slate-200 xl:bg-white xl:shadow-2xl xl:shadow-slate-950/10 xl:group-hover:grid">
              {aboutItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateAbout(item.id)}
                  className="min-h-10 rounded-xl px-4 text-start text-sm font-black text-slate-600 transition hover:bg-amber-50 hover:text-slate-950"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 xl:hidden">
            <AuthButtons />
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser ? (
            <span className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 2xl:inline-flex">
              <FiHeart />
              {currentUser.favorites.length}
            </span>
          ) : null}
          <div className="hidden items-center gap-2 2xl:flex">
            <AuthButtons />
          </div>
          <div className="group relative">
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50" aria-label="Change language">
              <FiGlobe /><span className="hidden sm:inline">{lang === "ar" ? "العربية" : lang === "fr" ? "Français" : "English"}</span><FiChevronDown />
            </button>
            <div className="invisible absolute end-0 top-full z-50 mt-2 grid min-w-40 translate-y-1 gap-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {([{ id: "ar", label: "العربية" }, { id: "en", label: "English" }, { id: "fr", label: "Français" }] as const).map((item) => <button key={item.id} type="button" onClick={() => setLang(item.id)} className={`min-h-10 rounded-xl px-4 text-start text-sm font-black ${lang === item.id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-amber-50"}`}>{item.label}</button>)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm xl:hidden"
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
