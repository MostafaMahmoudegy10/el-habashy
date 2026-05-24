import brandLogo from "../assets/el-habashy-logo.svg";
import { useApp } from "../context/AppContext";

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
        <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain p-1" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <strong className="block truncate text-lg font-black text-slate-950">{t.brand}</strong>
          <small className="block truncate text-xs font-bold text-slate-500">{t.brandSub}</small>
        </span>
      ) : null}
    </div>
  );
}
