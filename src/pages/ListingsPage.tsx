import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { useApp } from "../context/AppContext";
import { ListingCard } from "../components/ListingCard";
import { ListingDetails } from "../components/ListingDetails";
import type { ListingCategory, ListingStatus } from "../types";

export function ListingsPage() {
  const { lang, t, listings, selectedListing } = useApp();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState<"all" | ListingCategory>("all");
  const [status, setStatus] = useState<"all" | ListingStatus>("all");

  const cities = Array.from(new Set(listings.map((listing) => listing.city[lang])));
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const blob = [
        listing.title[lang],
        listing.city[lang],
        listing.area[lang],
        listing.description[lang],
        categoryLabel[listing.category][lang],
        statusLabel[listing.status][lang],
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || blob.includes(term)) &&
        (city === "all" || listing.city[lang] === city) &&
        (category === "all" || listing.category === category) &&
        (status === "all" || listing.status === status)
      );
    });
  }, [category, city, lang, listings, search, status]);

  const reset = () => {
    setSearch("");
    setCity("all");
    setCategory("all");
    setStatus("all");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-24">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{t.filters}</span>
            <h2 className="mt-1 text-xl font-black">{t.listings}</h2>
          </div>
          <FiFilter className="text-slate-400" size={22} />
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            {t.filters}
            <span className="relative">
              <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-11 w-full rounded-lg border border-slate-200 bg-stone-50 px-10 text-sm outline-none focus:border-amber-400"
              />
            </span>
          </label>

          <Select value={city} onChange={setCity} label={t.allCities}>
            <option value="all">{t.allCities}</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select value={category} onChange={(value) => setCategory(value as "all" | ListingCategory)} label={t.allCategories}>
            <option value="all">{t.allCategories}</option>
            {(Object.keys(categoryLabel) as ListingCategory[]).map((item) => (
              <option key={item} value={item}>
                {categoryLabel[item][lang]}
              </option>
            ))}
          </Select>

          <Select value={status} onChange={(value) => setStatus(value as "all" | ListingStatus)} label={t.allStatuses}>
            <option value="all">{t.allStatuses}</option>
            {(Object.keys(statusLabel) as ListingStatus[]).map((item) => (
              <option key={item} value={item}>
                {statusLabel[item][lang]}
              </option>
            ))}
          </Select>

          <button
            type="button"
            onClick={reset}
            className="mt-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-stone-100"
          >
            {t.reset}
          </button>
        </div>
      </aside>

      <div className="grid gap-6">
        <ListingDetails listing={selectedListing} />
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {!filtered.length ? (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <strong className="text-lg font-black">{t.noResults}</strong>
          </div>
        ) : null}
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
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
      >
        {children}
      </select>
    </label>
  );
}
