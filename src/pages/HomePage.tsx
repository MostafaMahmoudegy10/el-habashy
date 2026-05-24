import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { useApp } from "../context/AppContext";
import { ListingCard } from "../components/ListingCard";
import { SectionHeading } from "../components/SectionHeading";
import type { ListingCategory } from "../types";

export function HomePage() {
  const { lang, t, listings, navigate, selectListing } = useApp();
  const featured = listings.filter((listing) => listing.featured).slice(0, 3);
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const endedCount = listings.filter((listing) => listing.status === "ended").length;
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-6 lg:py-12">
          <div className="flex min-h-[430px] flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
              {t.heroEyebrow}
            </div>
            <h1 className="max-w-4xl animate-fade-up text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">{t.heroText}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {(Object.keys(categoryLabel) as ListingCategory[]).map((category) => {
                const Icon = categoryIcon[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => navigate("listings")}
                    className="rounded-lg border border-slate-200 bg-stone-50 p-3 text-start transition hover:-translate-y-1 hover:bg-white hover:shadow-card"
                  >
                    <Icon className="text-amber-600" size={20} />
                    <strong className="mt-2 block text-sm font-black">{categoryLabel[category][lang]}</strong>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate("listings")}
              className="mt-7 flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 shadow-card transition hover:bg-amber-300"
            >
              {t.browseListings}
              <ArrowIcon />
            </button>
          </div>

          <div className="grid content-start gap-3 rounded-lg border border-slate-200 bg-stone-50 p-3 shadow-card">
            <div className="grid grid-cols-2 gap-3">
              <StatMini label={statusLabel.active[lang]} value={activeCount} tone="emerald" />
              <StatMini label={statusLabel.ended[lang]} value={endedCount} tone="slate" />
            </div>
            {listings.slice(0, 4).map((listing) => {
              const Icon = categoryIcon[listing.category];
              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => selectListing(listing.id)}
                  className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 rounded-lg bg-white p-2 text-start transition hover:shadow-card"
                >
                  <img src={listing.images[0]} alt={listing.title[lang]} className="h-20 w-full rounded-lg object-cover" />
                  <span>
                    <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-xs font-black text-slate-600">
                      <Icon />
                      {categoryLabel[listing.category][lang]}
                    </span>
                    <strong className="line-clamp-2 block text-sm font-black leading-6">{listing.title[lang]}</strong>
                    <small className="mt-1 block text-xs font-bold text-slate-500">
                      {listing.city[lang]} · {listing.measureLabel}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <SectionHeading
          eyebrow={t.featuredListings}
          title={lang === "ar" ? "أقسام واضحة وعروض سهلة التصفح" : "Clear categories and easy browsing"}
          subtitle={
            lang === "ar"
              ? "كل كارت يعرض القسم، الحالة، المكان، وزر واتساب مباشر لطلب كراسة الشروط."
              : "Each card shows category, status, location, and a direct WhatsApp booklet button."
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </>
  );
}

function StatMini({ label, value, tone }: { label: string; value: number; tone: "emerald" | "slate" }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <strong className={`mt-1 block text-2xl font-black ${tone === "emerald" ? "text-emerald-700" : "text-slate-700"}`}>
        {value}
      </strong>
    </div>
  );
}
