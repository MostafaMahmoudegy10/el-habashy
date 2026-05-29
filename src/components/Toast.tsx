import { FiCheckCircle } from "react-icons/fi";
import { useApp } from "../context/AppContext";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-4 text-sm font-black text-emerald-800 shadow-2xl shadow-slate-950/15 backdrop-blur">
      <FiCheckCircle className="shrink-0" />
      {toast}
    </div>
  );
}
