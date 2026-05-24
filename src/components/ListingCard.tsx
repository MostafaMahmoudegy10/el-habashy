import { FiEye, FiGrid, FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { useApp } from "../context/AppContext";
import { WhatsAppButton } from "./WhatsAppButton";
import type { Listing } from "../types";

export function ListingCard({ listing }: { listing: Listing }) {
  const { lang, t, savedIds, compareIds, selectListing, toggleSaved, toggleCompare } = useApp();
  const CategoryIcon = categoryIcon[listing.category];
  const saved = savedIds.includes(listing.id);
  const compared = compareIds.includes(listing.id);

  return (
    <article className="animate-fade-up overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[1.35] overflow-hidden bg-slate-100">
        <img src={listing.images[0]} alt={listing.title[lang]} className="h-full w-full object-cover" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-black ring-1 ${
              listing.status === "active"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-slate-100 text-slate-600 ring-slate-200"
            }`}
          >
            {statusLabel[listing.status][lang]}
          </span>
          {listing.featured ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2.5 py-1 text-xs font-black text-amber-300">
              <FiStar />
              {t.featuredListings}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CategoryIcon />
              {categoryLabel[listing.category][lang]}
            </span>
            <span>{listing.measureLabel}</span>
          </div>
          <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7">{listing.title[lang]}</h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
            {listing.description[lang]}
          </p>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-2">
            <FiMapPin />
            {listing.city[lang]} · {listing.area[lang]}
          </span>
          <strong className="text-slate-950">{listing.priceLabel[lang]}</strong>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <WhatsAppButton listing={listing} className="col-span-2" />
          <button
            type="button"
            onClick={() => selectListing(listing.id)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-stone-100"
          >
            <FiEye />
            {t.details}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleSaved(listing.id)}
              className={`grid h-10 place-items-center rounded-lg border ${
                saved ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600"
              }`}
              aria-label={saved ? t.saved : t.save}
            >
              <FiHeart fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(listing.id)}
              className={`grid h-10 place-items-center rounded-lg border ${
                compared ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"
              }`}
              aria-label={t.compare}
            >
              <FiGrid />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
