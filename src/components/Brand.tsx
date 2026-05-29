import brandLogo from "../assets/el-habashy-logo.svg";
import { useApp } from "../context/AppContext";

export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const { t } = useApp();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-12 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg shadow-amber-900/10">
        <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain p-1.5" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <strong className={`block truncate text-lg font-black ${inverted ? "text-white" : "text-slate-950"}`}>{t.brand}</strong>
          <small className={`block truncate text-xs font-bold ${inverted ? "text-slate-300" : "text-slate-500"}`}>{t.brandSub}</small>
        </span>
      ) : null}
    </div>
  );
}
