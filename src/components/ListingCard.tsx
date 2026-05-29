import { FiArrowUpRight, FiBookmark, FiEye, FiFileText, FiHeart, FiMapPin } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { stripRichText } from "../lib/richText";
import { useApp } from "../context/AppContext";
import { LazyImage } from "./LazyImage";
import { WhatsAppButton } from "./WhatsAppButton";
import type { Listing } from "../types";

export function ListingCard({ listing, elevated = false }: { listing: Listing; elevated?: boolean }) {
  const { lang, t, currentUser, selectListing, toggleFavorite } = useApp();
  const CategoryIcon = categoryIcon[listing.category];
  const favorite = Boolean(currentUser?.favorites.includes(listing.id));

  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-1 hover:border-amber-300 ${
        elevated ? "shadow-2xl shadow-slate-950/10" : "shadow-sm hover:shadow-xl hover:shadow-slate-950/10"
      }`}
    >
      <div className="relative overflow-hidden">
        <LazyImage
          src={listing.images[0]}
          alt={listing.title[lang]}
          className="aspect-[1.28] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-950 shadow-sm backdrop-blur">
            <CategoryIcon className="text-amber-600" />
            {categoryLabel[listing.category][lang]}
          </span>
          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            className={`grid h-10 w-10 place-items-center rounded-full shadow-sm backdrop-blur transition ${
              favorite ? "bg-rose-500 text-white" : "bg-white/90 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
            }`}
            aria-label={t.addFavorite}
          >
            <FiHeart fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-4">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
            {statusLabel[listing.status][lang]}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <button type="button" onClick={() => selectListing(listing.id)} className="text-start">
            <h3 className="line-clamp-2 min-h-16 text-xl font-black leading-8 text-slate-950">
              {listing.title[lang]}
            </h3>
          </button>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
            {listing.summary[lang] || stripRichText(listing.description[lang])}
          </p>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-2">
            <FiMapPin className="text-amber-600" />
            {listing.city[lang]}
          </span>
          <strong className="text-base text-slate-950">{listing.priceLabel[lang]}</strong>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
          <MiniStat icon={FiEye} value={listing.views} />
          <MiniStat icon={FiFileText} value={listing.bookletRequests} />
          <MiniStat icon={FiBookmark} value={listing.measureLabel} text />
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={() => selectListing(listing.id)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-amber-300 hover:bg-amber-50"
          >
            {t.viewDetails}
            <FiArrowUpRight />
          </button>
          <WhatsAppButton listing={listing} compact className="px-4" />
        </div>
      </div>
    </article>
  );
}

function MiniStat({
  icon: Icon,
  value,
  text,
}: {
  icon: typeof FiEye;
  value: number | string;
  text?: boolean;
}) {
  return (
    <span className="grid gap-1 text-xs font-black text-slate-500">
      <Icon className="mx-auto text-amber-600" />
      <span className={text ? "truncate" : ""}>{typeof value === "number" ? value.toLocaleString() : value}</span>
    </span>
  );
}
