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
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 ${className}`}
    >
      <FaWhatsapp size={18} />
      {compact ? t.whatsappBooklet : t.whatsappBooklet}
    </a>
  );
}
