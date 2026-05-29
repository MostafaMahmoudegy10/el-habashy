import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiMessageCircle,
  FiMousePointer,
  FiSearch,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { categoryLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { useApp } from "../context/AppContext";
import { ListingCard } from "../components/ListingCard";
import { SectionHeading } from "../components/SectionHeading";
import type { Listing, ListingCategory } from "../types";

export function HomePage() {
  const { lang, t, listings, navigate, selectListing } = useApp();
  const [slide, setSlide] = useState(0);
  const featured = listings.filter((listing) => listing.featured);
  const latest = useMemo(
    () => [...listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    [listings],
  );
  const requested = useMemo(
    () => [...listings].sort((a, b) => b.bookletRequests - a.bookletRequests).slice(0, 3),
    [listings],
  );
  const slides = featured.length ? featured : latest;
  const active = slides[slide % slides.length] ?? listings[0];
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  const changeSlide = (direction: number) => {
    setSlide((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-amber-100/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,119,6,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(15,23,42,0.12),transparent_25%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:px-6 lg:py-16">
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs font-black uppercase text-amber-800 shadow-sm backdrop-blur">
              {t.heroEyebrow}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-normal text-slate-950 md:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600 md:text-lg">
              {t.heroText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("listings")}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-2xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-800"
              >
                {t.browseListings}
                <ArrowIcon />
              </button>
              <button
                type="button"
                onClick={() => active && selectListing(active.id)}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-amber-200 bg-white/75 px-6 py-3 text-sm font-black text-slate-800 shadow-lg shadow-amber-900/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-400 hover:bg-white"
              >
                {t.requestBooklet}
                <FiFileText />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <HeroMetric value={listings.length} label={t.totalListings} />
              <HeroMetric value={listings.filter((listing) => listing.status === "active").length} label={t.activeListings} />
              <HeroMetric value={listings.reduce((sum, listing) => sum + listing.bookletRequests, 0)} label={t.bookletRequests} />
            </div>
          </div>

          {active ? (
            <div className="rounded-[2rem] border border-white/70 bg-white/65 p-3 shadow-2xl shadow-slate-950/15 backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950">
                <img src={active.images[0]} alt={active.title[lang]} className="aspect-[1.05] w-full object-cover md:aspect-[1.22]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                    {categoryLabel[active.category][lang]}
                  </span>
                  <h2 className="mt-4 line-clamp-2 text-2xl font-black leading-tight md:text-4xl">
                    {active.title[lang]}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-7 text-slate-200">
                    {active.summary[lang]}
                  </p>
                </div>
                <div className="absolute end-4 top-4 flex gap-2">
                  <SliderButton onClick={() => changeSlide(lang === "ar" ? 1 : -1)}>
                    {lang === "ar" ? <FiChevronRight /> : <FiChevronLeft />}
                  </SliderButton>
                  <SliderButton onClick={() => changeSlide(lang === "ar" ? -1 : 1)}>
                    {lang === "ar" ? <FiChevronLeft /> : <FiChevronRight />}
                  </SliderButton>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {slides.slice(0, 3).map((listing, index) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSlide(index)}
                    className={`overflow-hidden rounded-2xl border transition duration-300 ${
                      index === slide ? "border-amber-400 ring-4 ring-amber-200/60" : "border-white/70 hover:border-amber-300"
                    }`}
                  >
                    <img src={listing.images[0]} alt="" className="aspect-[1.45] w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {(Object.keys(categoryLabel) as ListingCategory[]).map((category) => {
            const Icon = categoryIcon[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => navigate("listings")}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-start shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-950/10"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-amber-300 transition duration-300 group-hover:scale-105">
                  <Icon size={22} />
                </span>
                <strong className="mt-4 block text-lg font-black text-slate-950">{categoryLabel[category][lang]}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <SectionHeading
          eyebrow={t.featuredListings}
          title={lang === "ar" ? "أصول مختارة بعناية" : "Carefully selected assets"}
          subtitle={lang === "ar" ? "صور واضحة، بيانات مختصرة، وخطوة مباشرة لطلب كراسة الشروط." : "Clear photos, focused data, and one direct step to request the booklet."}
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} elevated />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-6">
        <ListingRail title={t.latestListings} listings={latest} />
        <ListingRail title={t.mostRequested} listings={requested} />
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:px-6">
          <div>
            <span className="text-xs font-black uppercase text-amber-300">{t.howItWorks}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
              {lang === "ar" ? "من العرض إلى التواصل في أربع خطوات" : "From listing to contact in four steps"}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: FiSearch, text: lang === "ar" ? "تصفح العروض" : "Browse listings" },
              { icon: FiMousePointer, text: lang === "ar" ? "شاهد التفاصيل" : "View details" },
              { icon: FiFileText, text: lang === "ar" ? "اطلب الكراسة" : "Request booklet" },
              { icon: FaWhatsapp, text: lang === "ar" ? "تواصل واتساب" : "Contact on WhatsApp" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-slate-950">
                    <Icon />
                  </span>
                  <strong className="mt-5 block text-lg font-black">{index + 1}. {item.text}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_0.9fr] lg:px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/5">
          <span className="text-xs font-black uppercase text-amber-700">{t.about}</span>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
            {lang === "ar" ? "الحبشي يعرض الأصول بطريقة واضحة ومحترفة" : "El Habashy presents assets clearly and professionally"}
          </h2>
          <p className="mt-4 text-sm font-semibold leading-8 text-slate-600">
            {lang === "ar"
              ? "المنصة مصممة لمساعدة العملاء على فهم بيانات العرض بسرعة، مشاهدة الصور، وطلب المستندات من خلال مسار بسيط ومنظم."
              : "The platform helps customers understand listing data quickly, inspect photos, and request documents through a simple organized flow."}
          </p>
          <div className="mt-6 grid gap-3">
            {[t.featuredListings, t.requestBooklet, t.whatsapp].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm font-black text-slate-700">
                <FiCheckCircle className="text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-xl shadow-amber-900/10">
          <span className="text-xs font-black uppercase text-amber-800">{t.contact}</span>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
            {lang === "ar" ? "تحتاج كراسة شروط؟" : "Need a booklet?"}
          </h2>
          <p className="mt-4 text-sm font-semibold leading-8 text-slate-700">
            {lang === "ar"
              ? "اختر العرض المناسب واضغط طلب كراسة الشروط، وسيتم حفظ طلبك ومتابعته من لوحة التحكم."
              : "Choose the listing and request the booklet. Your request will be saved and handled from the dashboard."}
          </p>
          <button
            type="button"
            onClick={() => navigate("listings")}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-slate-800"
          >
            {t.browseListings}
            <ArrowIcon />
          </button>
        </div>
      </section>
    </>
  );
}

function HeroMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <strong className="block text-3xl font-black text-slate-950">{value.toLocaleString()}</strong>
      <span className="mt-1 block text-xs font-black text-slate-500">{label}</span>
    </div>
  );
}

function SliderButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-950 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
    >
      {children}
    </button>
  );
}

function ListingRail({ title, listings }: { title: string; listings: Listing[] }) {
  const { lang, selectListing } = useApp();

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <div className="mt-5 grid gap-3">
        {listings.map((listing) => (
          <button
            key={listing.id}
            type="button"
            onClick={() => selectListing(listing.id)}
            className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2 text-start transition hover:border-amber-300 hover:bg-white"
          >
            <img src={listing.images[0]} alt="" className="h-24 rounded-xl object-cover" />
            <span className="min-w-0 py-2">
              <strong className="line-clamp-1 text-base font-black text-slate-950">{listing.title[lang]}</strong>
              <small className="mt-2 block text-xs font-bold text-slate-500">{listing.city[lang]} · {listing.bookletRequests}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
