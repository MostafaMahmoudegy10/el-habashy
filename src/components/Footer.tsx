import { Brand } from "./Brand";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";

export function Footer() {
  const { t, navigate } = useApp();
  const links: Array<[Page, string]> = [
    ["home", t.home],
    ["listings", t.listings],
    ["about", t.about],
    ["dashboard", t.dashboard],
  ];

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
        <div>
          <Brand />
          <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500">
            {t.heroText}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-600 hover:bg-stone-100"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
