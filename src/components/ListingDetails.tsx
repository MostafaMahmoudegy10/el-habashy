import { FiFileText, FiHeart, FiImage, FiMapPin, FiShield, FiUsers } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { useApp } from "../context/AppContext";
import { WhatsAppButton } from "./WhatsAppButton";
import type { Listing } from "../types";

export function ListingDetails({ listing }: { listing: Listing }) {
  const { lang, t, savedIds, compareIds, toggleSaved, toggleCompare } = useApp();
  const CategoryIcon = categoryIcon[listing.category];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `https://elhabashy.com/listings/${listing.slug}`,
  )}`;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_390px]">
        <div className="grid gap-2 p-3 sm:grid-cols-[1.25fr_0.75fr]">
          <img src={listing.images[0]} alt={listing.title[lang]} className="h-full min-h-80 w-full rounded-lg object-cover" />
          <div className="grid gap-2">
            <img
              src={listing.images[1] ?? listing.images[0]}
              alt={listing.title[lang]}
              className="h-40 w-full rounded-lg object-cover sm:h-full"
            />
            <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-stone-50 p-4 text-center">
              <FiImage className="text-slate-400" size={28} />
              <span className="mt-2 text-sm font-black text-slate-600">{t.listingGallery}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-slate-200 p-5 lg:border-s lg:border-t-0">
          <div>
            <span
              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ring-1 ${
                listing.status === "active"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-slate-200"
              }`}
            >
              {statusLabel[listing.status][lang]}
            </span>
            <h2 className="mt-3 text-2xl font-black leading-9">{listing.title[lang]}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{listing.description[lang]}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: categoryLabel[listing.category][lang], value: listing.measureLabel, icon: CategoryIcon },
              { label: listing.city[lang], value: listing.area[lang], icon: FiMapPin },
              { label: t.visits, value: listing.visits.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), icon: FiUsers },
              { label: t.bookletClicks, value: listing.bookletClicks.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), icon: FiFileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={`${item.label}-${item.value}`} className="rounded-lg bg-stone-50 p-3">
                  <Icon className="text-amber-600" />
                  <strong className="mt-2 block text-sm font-black">{item.value}</strong>
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-black">{t.availableDocs}</h3>
            <div className="grid gap-2">
              {listing.documents.map((document) => (
                <div key={document.en} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FiFileText className="text-emerald-600" />
                    {document[lang]}
                  </span>
                  <FiShield className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black">{t.listingQr}</h3>
                <span className="mt-1 block text-xs font-bold text-slate-500">https://elhabashy.com/listings/{listing.slug}</span>
              </div>
              <img src={qrUrl} alt={t.listingQr} className="h-20 w-20 rounded-lg bg-white p-1" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <WhatsAppButton listing={listing} />
            <button
              type="button"
              onClick={() => toggleSaved(listing.id)}
              className={`grid h-12 w-full place-items-center rounded-lg border px-4 sm:w-12 ${
                savedIds.includes(listing.id)
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={t.save}
            >
              <FiHeart fill={savedIds.includes(listing.id) ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(listing.id)}
              className={`grid h-12 w-full place-items-center rounded-lg border px-4 sm:w-12 ${
                compareIds.includes(listing.id)
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={t.compare}
            >
              <CategoryIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
