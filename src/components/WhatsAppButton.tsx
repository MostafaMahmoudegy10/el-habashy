import { FaWhatsapp } from "react-icons/fa6";
import { useApp } from "../context/AppContext";
import type { Listing } from "../types";

export function WhatsAppButton({
  listing,
  compact = false,
  className = "",
}: {
  listing: Listing;
  compact?: boolean;
  className?: string;
}) {
  const { t, getWhatsAppUrl, trackWhatsApp } = useApp();

  return (
    <a
      href={getWhatsAppUrl(listing)}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackWhatsApp(listing.id)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-900/20 ${className}`}
    >
      <FaWhatsapp size={18} />
      {compact ? t.whatsapp : t.whatsapp}
    </a>
  );
}
