import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FiArrowLeft, FiArrowRight, FiGrid, FiList, FiLoader, FiSearch, FiSliders } from "react-icons/fi";
import { statusLabel } from "../lib/i18n";
import { getSectorTitle } from "../lib/sectors";
import { useApp } from "../context/AppContext";
import { LazyImage } from "../components/LazyImage";
import { ListingCard } from "../components/ListingCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import type { Listing, ListingCategory, ListingStatus } from "../types";
import type { PageResponse } from "../lib/elHabashyApi";

type SortMode = "latest" | "views" | "whatsapp";

export function ListingsPage() {
  const {
    lang,
    t,
    listingCities,
    sectors,
    listingCategoryFilter,
    setListingCategoryFilter,
    selectListing,
    searchListings,
  } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | ListingCategory>(listingCategoryFilter);
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortMode>("latest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [resultPage, setResultPage] = useState<PageResponse<Listing> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchRetry, setSearchRetry] = useState(0);

  useEffect(() => {
    setCategory(listingCategoryFilter);
  }, [listingCategoryFilter]);

  useEffect(() => {
    const term = search.trim();
    if (term.length === 1) {
      setResultPage(null);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");
    const timeout = window.setTimeout(() => {
      void searchListings({
        q: term || undefined,
        category: category === "all" ? undefined : category,
        status: status === "all" ? undefined : status,
        city: city === "all" ? undefined : city,
        page: pageIndex,
        size: 12,
        sort: sort === "views"
          ? "views,desc"
          : sort === "whatsapp"
            ? "whatsappClicks,desc"
            : "createdAt,desc",
      }, controller.signal)
        .then((response) => {
          setResultPage(response);
        })
        .catch((caught) => {
          if (caught instanceof Error && caught.name === "AbortError") return;
          setResultPage(null);
          setSearchError(caught instanceof Error ? caught.message : (lang === "ar" ? "تعذر تنفيذ البحث." : "Search failed."));
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false);
        });
    }, term ? 350 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [category, city, lang, pageIndex, search, searchListings, searchRetry, sort, status]);

  const results = resultPage?.content ?? [];
  const totalResults = resultPage?.totalElements ?? 0;

  const reset = () => {
    setSearch("");
    setCategory("all");
    setListingCategoryFilter("all");
    setStatus("all");
    setCity("all");
    setSort("latest");
    setPageIndex(0);
    setResultPage(null);
    setSearchError("");
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
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageIndex(0);
                }}
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
              setPageIndex(0);
            }}
          >
            <option value="all">{t.allCategories}</option>
            {sectors.map((item) => (
              <option key={item.id} value={item.id}>{item.title[lang]}</option>
            ))}
          </Select>

          <Select label={t.status} value={status} onChange={(value) => { setStatus(value as "all" | ListingStatus); setPageIndex(0); }}>
            <option value="all">{t.allStatuses}</option>
            {(Object.keys(statusLabel) as ListingStatus[]).map((item) => (
              <option key={item} value={item}>{statusLabel[item][lang]}</option>
            ))}
          </Select>

          <Select label={t.allCities} value={city} onChange={(value) => { setCity(value); setPageIndex(0); }}>
            <option value="all">{t.allCities}</option>
            {listingCities.map((item) => (
              <option key={`${item.ar}-${item.en}`} value={item.en || item.ar}>{item[lang]}</option>
            ))}
          </Select>

          <Select label={lang === "ar" ? "الترتيب" : "Sort"} value={sort} onChange={(value) => { setSort(value as SortMode); setPageIndex(0); }}>
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
            <h2 className="mt-1 text-3xl font-black text-slate-950">{totalResults.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</h2>
          </div>
          <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
            <LayoutButton active={layout === "grid"} onClick={() => setLayout("grid")} icon={<FiGrid />} />
            <LayoutButton active={layout === "list"} onClick={() => setLayout("list")} icon={<FiList />} />
          </div>
        </div>

        {searchLoading ? (
          <div className="grid min-h-80 place-items-center rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="grid gap-3 text-sm font-black text-slate-600"><FiLoader className="mx-auto animate-spin text-3xl text-amber-600" />{lang === "ar" ? "جاري تحميل النتائج..." : "Loading results..."}</span>
          </div>
        ) : searchError ? (
          <div className="grid min-h-80 place-items-center rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
            <div><strong className="block text-lg font-black text-rose-700">{searchError}</strong><button type="button" onClick={() => setSearchRetry((value) => value + 1)} className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">{lang === "ar" ? "إعادة المحاولة" : "Retry"}</button></div>
          </div>
        ) : results.length ? (
          layout === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((listing) => (
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

        {resultPage && resultPage.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <button type="button" disabled={resultPage.first} onClick={() => setPageIndex((value) => Math.max(0, value - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label={lang === "ar" ? "الصفحة السابقة" : "Previous page"}>
              {lang === "ar" ? <FiArrowRight /> : <FiArrowLeft />}
            </button>
            <strong className="text-sm font-black text-slate-700">
              {(resultPage.page + 1).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} / {resultPage.totalPages.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
            </strong>
            <button type="button" disabled={resultPage.last} onClick={() => setPageIndex((value) => value + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label={lang === "ar" ? "الصفحة التالية" : "Next page"}>
              {lang === "ar" ? <FiArrowLeft /> : <FiArrowRight />}
            </button>
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
