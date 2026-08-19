import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft, FiArrowRight, FiLoader, FiMapPin, FiSearch, FiX } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import type { Listing } from "../types";
import { LazyImage } from "./LazyImage";

export function GlobalSearch() {
  const { lang, searchListings, selectListing, navigateListings } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const Arrow = lang === "ar" ? FiArrowLeft : FiArrowRight;

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }
    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void searchListings({ q: term, size: 8, sort: "relevance,desc" }, controller.signal)
        .then((response) => {
          if (requestId.current === currentRequest) setResults(response.content);
        })
        .catch((caught) => {
          if (caught instanceof Error && caught.name === "AbortError") return;
          if (requestId.current === currentRequest) {
            setError(caught instanceof Error ? caught.message : (lang === "ar" ? "تعذر البحث." : "Search failed."));
          }
        })
        .finally(() => {
          if (requestId.current === currentRequest) setLoading(false);
        });
    }, 280);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [lang, open, query, searchListings]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const choose = (listing: Listing) => {
    setOpen(false);
    setQuery("");
    selectListing(listing.id);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={lang === "ar" ? "البحث في العروض" : "Search listings"}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
      >
        <FiSearch />
        <span className="hidden 2xl:inline">{lang === "ar" ? "بحث" : "Search"}</span>
      </button>

      {open ? createPortal((
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl sm:mt-20">
            <div className="bg-slate-950 p-5 text-white sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase text-amber-300">{lang === "ar" ? "بحث شامل" : "Global search"}</span>
                  <h2 className="mt-1 text-2xl font-black">{lang === "ar" ? "دور في كل تفاصيل العروض" : "Search every listing detail"}</h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close"><FiX /></button>
              </div>
              <label className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 text-slate-950 shadow-xl">
                <FiSearch className="shrink-0 text-xl text-amber-700" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={lang === "ar" ? "اكتب اسم العرض، المدينة، المواصفات، الجهة أو أي كلمة..." : "Title, city, specifications, beneficiary or any keyword..."}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold outline-none sm:text-base"
                />
                {loading ? <FiLoader className="animate-spin text-amber-700" /> : null}
              </label>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-4 sm:p-6">
              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p> : null}
              {!error && query.trim().length < 2 ? (
                <div className="grid min-h-40 place-items-center text-center text-sm font-bold leading-7 text-slate-500">
                  {lang === "ar" ? "اكتب حرفين على الأقل، والبحث هيشمل الوصف والمواصفات والـSEO وكل بيانات العرض." : "Type at least two characters. Search covers descriptions, specifications, SEO, and all listing data."}
                </div>
              ) : null}
              {!error && query.trim().length >= 2 && !loading && !results.length ? (
                <div className="grid min-h-40 place-items-center text-sm font-black text-slate-500">{lang === "ar" ? "مفيش نتائج مطابقة." : "No matching listings."}</div>
              ) : null}
              {results.length ? (
                <div className="grid gap-3">
                  {results.map((listing) => (
                    <button key={listing.id} type="button" onClick={() => choose(listing)} className="group grid gap-4 rounded-2xl border border-slate-200 p-3 text-start transition hover:border-amber-300 hover:bg-amber-50/60 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center">
                      <LazyImage src={listing.images[0]} alt="" className="aspect-[1.45] w-full rounded-xl object-cover sm:h-20 sm:w-28" />
                      <span className="min-w-0">
                        <strong className="block truncate text-base font-black text-slate-950">{listing.title[lang]}</strong>
                        <small className="mt-2 flex items-center gap-1 font-bold text-slate-500"><FiMapPin />{listing.city[lang]} · {listing.priceLabel[lang]}</small>
                        <small className="mt-1 line-clamp-1 font-semibold text-slate-500">{listing.summary[lang]}</small>
                      </span>
                      <Arrow className="hidden text-xl text-amber-700 transition group-hover:translate-x-1 sm:block rtl:group-hover:-translate-x-1" />
                    </button>
                  ))}
                  <button type="button" onClick={() => { setOpen(false); navigateListings("all"); }} className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-black text-slate-700 hover:border-amber-300">
                    {lang === "ar" ? "عرض صفحة كل العروض" : "Open all listings"}<Arrow />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ), document.body) : null}
    </>
  );
}
