import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";

export function Footer() {
  const { t, navigate } = useApp();
  const links: Array<[Page, string]> = [
    ["home", t.home],
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
            {[FaFacebookF, FaLinkedinIn, FaWhatsapp].map((Icon, index) => (
              <span key={index} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-amber-300">
                <Icon />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
