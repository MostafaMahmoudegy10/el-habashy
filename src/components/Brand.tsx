import brandLogo from "../assets/el-habashy-official-logo.png";
import { useApp } from "../context/AppContext";

export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const { t } = useApp();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-14 w-14 shrink-0 place-items-center">
        <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain drop-shadow-lg" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <strong className={`block truncate text-lg font-black ${inverted ? "text-white" : "text-slate-950"}`}>{t.brand}</strong>
          <small className={`block max-w-52 text-[10px] font-bold leading-4 sm:text-xs ${inverted ? "text-slate-300" : "text-slate-500"}`}>{t.brandSub}</small>
        </span>
      ) : null}
    </div>
  );
}
