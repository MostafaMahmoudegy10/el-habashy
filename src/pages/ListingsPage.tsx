import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FiGrid, FiList, FiSearch, FiSliders } from "react-icons/fi";
import { statusLabel } from "../lib/i18n";
import { getSectorTitle } from "../lib/sectors";
import { stripRichText } from "../lib/richText";
import { useApp } from "../context/AppContext";
import { LazyImage } from "../components/LazyImage";
import { ListingCard } from "../components/ListingCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import type { ListingCategory, ListingStatus } from "../types";

type SortMode = "latest" | "views" | "whatsapp";

export function ListingsPage() {
  const { lang, t, listings, sectors, listingCategoryFilter, setListingCategoryFilter, selectListing } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | ListingCategory>(listingCategoryFilter);
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortMode>("latest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setCategory(listingCategoryFilter);
  }, [listingCategoryFilter]);

  const cities = useMemo(() => Array.from(new Set(listings.map((listing) => listing.city[lang]))), [lang, listings]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = listings.filter((listing) => {
      const blob = [
        listing.title[lang],
        listing.summary[lang],
        stripRichText(listing.description[lang]),
        listing.city[lang],
        listing.location[lang],
        getSectorTitle(sectors, listing.category, lang),
        statusLabel[listing.status][lang],
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || blob.includes(term)) &&
        (category === "all" || listing.category === category) &&
        (status === "all" || listing.status === status) &&
        (city === "all" || listing.city[lang] === city)
      );
    });

    return rows.sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      if (sort === "whatsapp") return b.whatsappClicks - a.whatsappClicks;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [category, city, lang, listings, search, sectors, sort, status]);

  const reset = () => {
    setSearch("");
    setCategory("all");
    setListingCategoryFilter("all");
    setStatus("all");
    setCity("all");
    setSort("latest");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6 lg:py-10">
      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-950/5 backdrop-blur lg:sticky lg:top-28">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{t.filters}</span>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{t.listings}</h1>
          </div>
          <FiSliders className="text-slate-400" size={22} />
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            {t.searchPlaceholder}
            <span className="relative">
              <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 text-sm outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </span>
          </label>

          <Select
            label={t.category}
            value={category}
            onChange={(value) => {
              const next = value as "all" | ListingCategory;
              setCategory(next);
              setListingCategoryFilter(next);
            }}
          >
            <option value="all">{t.allCategories}</option>
            {sectors.map((item) => (
              <option key={item.id} value={item.id}>{item.title[lang]}</option>
            ))}
          </Select>

          <Select label={t.status} value={status} onChange={(value) => setStatus(value as "all" | ListingStatus)}>
            <option value="all">{t.allStatuses}</option>
            {(Object.keys(statusLabel) as ListingStatus[]).map((item) => (
              <option key={item} value={item}>{statusLabel[item][lang]}</option>
            ))}
          </Select>

          <Select label={t.allCities} value={city} onChange={setCity}>
            <option value="all">{t.allCities}</option>
            {cities.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>

          <Select label={lang === "ar" ? "الترتيب" : lang === "fr" ? "Tri" : "Sort"} value={sort} onChange={(value) => setSort(value as SortMode)}>
            <option value="latest">{t.sortLatest}</option>
            <option value="views">{t.sortViews}</option>
            <option value="whatsapp">{t.sortWhatsapp}</option>
          </Select>

          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            {t.reset}
          </button>
        </div>
      </aside>

      <div className="grid gap-6">
        <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{t.listings}</span>
            <h2 className="mt-1 text-3xl font-black text-slate-950">{filtered.length.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</h2>
          </div>
          <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
            <LayoutButton active={layout === "grid"} onClick={() => setLayout("grid")} icon={<FiGrid />} />
            <LayoutButton active={layout === "list"} onClick={() => setLayout("list")} icon={<FiList />} />
          </div>
        </div>

        {filtered.length ? (
          layout === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((listing) => (
                <article key={listing.id} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-950/5 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-center">
                  <LazyImage src={listing.images[0]} alt={listing.title[lang]} className="h-56 w-full rounded-3xl object-cover md:h-44" />
                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                      {getSectorTitle(sectors, listing.category, lang)}
                    </span>
                    <h3 className="mt-3 text-2xl font-black text-slate-950">{listing.title[lang]}</h3>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-7 text-slate-500">{listing.summary[lang]}</p>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => selectListing(listing.id)}
                      className="h-11 rounded-full bg-slate-950 px-5 text-sm font-black text-white"
                    >
                      {t.viewDetails}
                    </button>
                    <WhatsAppButton listing={listing} compact />
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          <div className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <strong className="text-xl font-black text-slate-950">{t.noResults}</strong>
          </div>
        )}
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-amber-400 focus:bg-white"
      >
        {children}
      </select>
    </label>
  );
}

function LayoutButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-10 w-12 place-items-center rounded-full transition ${
        active ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-white"
      }`}
    >
      {icon}
    </button>
  );
}
