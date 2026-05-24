import { FiX } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { useApp } from "../context/AppContext";
import { SectionHeading } from "../components/SectionHeading";
import { WhatsAppButton } from "../components/WhatsAppButton";

export function ComparePage() {
  const { lang, t, listings, compareIds, toggleCompare, navigate } = useApp();
  const compared = listings.filter((listing) => compareIds.includes(listing.id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        eyebrow={t.compare}
        title={lang === "ar" ? "مقارنة سريعة بين العروض" : "Quick comparison between listings"}
        subtitle={
          lang === "ar"
            ? "اختار حتى 3 عروض وقارن القسم، الحالة، القيمة والكمية."
            : "Select up to 3 listings and compare category, status, value, and quantity."
        }
      />

      {compared.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {compared.map((listing) => (
            <article key={listing.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
              <img src={listing.images[0]} alt={listing.title[lang]} className="h-52 w-full rounded-lg object-cover" />
              <span className="mt-4 inline-flex rounded-md bg-stone-100 px-2.5 py-1 text-xs font-black text-slate-600">
                {statusLabel[listing.status][lang]}
              </span>
              <h3 className="mt-3 min-h-16 text-lg font-black leading-8">{listing.title[lang]}</h3>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
                <span>{categoryLabel[listing.category][lang]}</span>
                <span>{listing.city[lang]} · {listing.area[lang]}</span>
                <span>{listing.measureLabel}</span>
                <strong className="text-base text-slate-950">{listing.priceLabel[lang]}</strong>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <WhatsAppButton listing={listing} compact />
                <button
                  type="button"
                  onClick={() => toggleCompare(listing.id)}
                  className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-700"
                  aria-label={t.remove}
                >
                  <FiX />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <strong className="block text-lg font-black">{t.compareEmpty}</strong>
            <button
              type="button"
              onClick={() => navigate("listings")}
              className="mt-5 h-11 rounded-lg bg-slate-950 px-5 text-sm font-black text-white"
            >
              {t.browseListings}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
