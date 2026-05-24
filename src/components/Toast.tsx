import { FiCheckCircle } from "react-icons/fi";
import { useApp } from "../context/AppContext";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 animate-scale-in items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-soft">
      <FiCheckCircle />
      {toast}
    </div>
  );
}
