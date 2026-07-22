import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";

export function Footer() {
  const { lang, settings, t, navigate } = useApp();
  const links: Array<[Page, string]> = [
    ["home", t.home],
    ["about", t.about],
    ["services", lang === "ar" ? "الخدمات" : "Services"],
    ["listings", t.listings],
    ["login", t.login],
    ["dashboard", t.dashboard],
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
        <div>
          <Brand inverted />
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300">{t.heroText}</p>
        </div>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {links.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                className="h-11 rounded-full border border-white/10 px-4 text-sm font-black text-slate-200 transition hover:bg-white hover:text-slate-950"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 lg:justify-end">
            {[
              { icon: FaFacebookF, href: settings.facebookUrl },
              { icon: FaLinkedinIn, href: settings.linkedinUrl },
              { icon: FaWhatsapp, href: `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}` },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <a key={index} href={item.href || "#"} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-amber-300 transition hover:bg-white hover:text-slate-950">
                  <Icon />
                </a>
              );
            })}
          </div>
          <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-start transition hover:border-amber-300/60 hover:bg-white/10">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950"><FiMapPin /></span>
            <span><small className="block text-xs font-black text-amber-200">{lang === "ar" ? "موقعنا على الخريطة" : "Find us on the map"}</small><strong className="mt-1 block text-sm font-black text-white">{settings.officeAddress[lang]}</strong></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
