import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  FiArrowUpRight,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiMail,
  FiLoader,
  FiMapPin,
  FiMessageCircle,
  FiMousePointer,
  FiPhone,
  FiSearch,
  FiShield,
  FiStar,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { categoryIcon } from "../lib/icons";
import { getSectorTitle } from "../lib/sectors";
import { useApp } from "../context/AppContext";
import { ListingCard } from "../components/ListingCard";
import { LazyImage } from "../components/LazyImage";
import { SectionHeading } from "../components/SectionHeading";
import heroBackground from "../assets/elhabashy-hero-bg.jpg";
import type { Listing } from "../types";

export function HomePage() {
  const {
    lang,
    t,
    listings,
    featuredListings,
    listingsLoading,
    listingsError,
    listingInsights,
    sectors,
    sectorsError,
    services,
    reloadContent,
    navigate,
    navigateListings,
    selectListing,
    selectService,
  } = useApp();
  const [slide, setSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const featured = featuredListings;
  const latest = useMemo(
    () => [...listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [listings],
  );
  const localContacted = useMemo(
    () => [...listings].sort((a, b) => b.whatsappClicks - a.whatsappClicks).slice(0, 5),
    [listings],
  );
  const contacted = listingInsights?.topContactedListings ?? localContacted;
  const slides = featured.length ? featured : latest;
  const active = slides[slide % slides.length] ?? listings[0];
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  const changeSlide = (direction: number) => {
    setSlide((current) => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    setSlide((current) => slides.length ? current % slides.length : 0);
  }, [slides.length]);

  useEffect(() => {
    if (heroPaused || slides.length < 2) return;
    const interval = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [heroPaused, slides.length]);

  return (
    <>
      {listingsLoading ? (
        <div className="flex items-center justify-center gap-3 bg-amber-50 px-4 py-3 text-sm font-black text-amber-800"><FiLoader className="animate-spin" />{lang === "ar" ? "جاري تحميل أحدث الإعلانات..." : "Loading latest listings..."}</div>
      ) : null}
      {(listingsError || sectorsError) ? (
        <div className="flex flex-col items-center justify-center gap-3 bg-rose-50 px-4 py-3 text-center text-sm font-black text-rose-700 sm:flex-row"><span>{listingsError || sectorsError}</span><button type="button" onClick={() => void reloadContent()} className="underline">{lang === "ar" ? "إعادة المحاولة" : "Retry"}</button></div>
      ) : null}
      <section
        className="relative overflow-hidden border-b border-amber-100/80 bg-slate-950"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/64 to-white/10 rtl:bg-gradient-to-l" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(245,158,11,0.24),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.82))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:px-6 lg:py-16">
          <div className="flex flex-col justify-center animate-fade-up">
            <span className="w-fit rounded-full border border-amber-300/50 bg-white/10 px-4 py-2 text-xs font-black uppercase text-amber-200 shadow-sm backdrop-blur">
              {t.heroEyebrow}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-normal text-white md:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-200 md:text-lg">
              {t.heroText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigateListings("all")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 shadow-2xl shadow-amber-950/20 transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
              >
                {t.browseListings}
                <ArrowIcon />
              </button>
              <button
                type="button"
                onClick={() => active && selectListing(active.id)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white shadow-lg shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:bg-white/15"
              >
                {t.viewDetails}
                <FiExternalLink />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <HeroMetric value={listingInsights?.totalListings ?? listings.length} label={t.totalListings} />
              <HeroMetric value={listingInsights?.activeListings ?? listings.filter((listing) => listing.status === "active").length} label={t.activeListings} />
              <HeroMetric value={listingInsights?.totalWhatsappClicks ?? listings.reduce((sum, listing) => sum + listing.whatsappClicks, 0)} label={t.whatsappClicks} />
            </div>
          </div>

          {active ? (
            <div
              className="rounded-[2rem] border border-white/70 bg-white/65 p-3 shadow-2xl shadow-slate-950/15 backdrop-blur-xl animate-float"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              onFocusCapture={() => setHeroPaused(true)}
              onBlurCapture={() => setHeroPaused(false)}
            >
              <div key={active.id} className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 animate-fade-up" aria-live="polite">
                <LazyImage
                  eager
                  src={active.images[0]}
                  alt={active.title[lang]}
                  className="aspect-[1.05] w-full object-cover md:aspect-[1.22]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                    {getSectorTitle(sectors, active.category, lang)}
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
              <div className="mt-3 grid grid-cols-4 gap-3">
                {slides.slice(0, 4).map((listing, index) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSlide(index)}
                    className={`overflow-hidden rounded-2xl border transition duration-300 ${
                      index === slide % slides.length ? "border-amber-400 ring-4 ring-amber-200/60" : "border-white/70 hover:border-amber-300"
                    }`}
                  >
                    <LazyImage src={listing.images[0]} alt="" className="aspect-[1.45] w-full object-cover" />
                  </button>
                ))}
              </div>
              {slides.length > 1 ? (
                <div className="mt-3 flex items-center justify-center gap-1.5" aria-label={lang === "ar" ? "شرائح المزادات المميزة" : "Featured auction slides"}>
                  {slides.map((listing, index) => (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === slide % slides.length ? "w-8 bg-amber-500" : "w-2 bg-slate-300 hover:bg-amber-300"}`}
                      aria-label={`${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {sectors.map((sector) => {
            const Icon = categoryIcon[sector.id];
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => navigateListings(sector.id)}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-start shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-950/10"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-amber-300 transition duration-300 group-hover:scale-105">
                  <Icon size={22} />
                </span>
                <strong className="mt-4 block text-lg font-black text-slate-950">{sector.title[lang]}</strong>
                <small className="mt-2 line-clamp-2 block text-xs font-bold leading-5 text-slate-500">{sector.description[lang]}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <SectionHeading eyebrow={lang === "ar" ? "ما نقدمه" : "What we do"} title={lang === "ar" ? "الخدمات" : "Our services"} subtitle={lang === "ar" ? "خبرات متكاملة في التحكيم والتقييم والاستشارات ودراسات الجدوى." : "Integrated arbitration, valuation, consulting and feasibility expertise."} />
        <div className="grid gap-5 md:grid-cols-3">{services.filter((item) => item.featured).slice(0, 3).map((service) => <button key={service.id} type="button" onClick={() => selectService(service.id)} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-start shadow-xl shadow-slate-950/5 transition hover:-translate-y-1 hover:border-amber-300"><LazyImage src={service.image} alt="" className="aspect-[1.6] w-full object-cover transition duration-500 group-hover:scale-105"/><span className="block p-5"><small className="font-black text-amber-700">{service.kind === "arbitration" ? (lang === "ar" ? "قطاعات التحكيم" : "Arbitration") : service.kind === "valuation" ? (lang === "ar" ? "التقييمات" : "Valuation") : (lang === "ar" ? "الاستشارات" : "Consulting")}</small><strong className="mt-2 block text-xl font-black text-slate-950">{service.title[lang]}</strong><span className="mt-3 line-clamp-2 text-sm font-semibold leading-7 text-slate-600">{service.summary[lang]}</span></span></button>)}</div>
        <button type="button" onClick={() => navigate("services")} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-slate-950 px-6 text-sm font-black text-white">{lang === "ar" ? "عرض كل الخدمات" : "View all services"}</button>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <SectionHeading
          eyebrow={t.featuredListings}
          title={lang === "ar" ? "أصول مختارة بعناية" : "Carefully selected assets"}
          subtitle={
            lang === "ar"
              ? "صور واضحة، بيانات مختصرة، وخطوة مباشرة للتواصل مع الفريق."
              : "Clear photos, focused data, and one direct step to contact the team."
          }
        />
        <FeaturedListingsRail listings={featured.length ? featured : latest} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:px-6">
        <LatestAdditionsPanel listings={latest} />
        <MostContactedBoard listings={contacted} />
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
              { icon: FiMapPin, text: lang === "ar" ? "راجع المكان" : "Check location" },
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

      <HomeAboutPreview />

      <ContactExperience />
    </>
  );
}

function HeroMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur">
      <strong className="block text-3xl font-black text-white">{value.toLocaleString()}</strong>
      <span className="mt-1 block text-xs font-black text-slate-200">{label}</span>
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

function FeaturedListingsRail({ listings }: { listings: Listing[] }) {
  const { lang } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!listings.length) return null;

  const safeActive = Math.min(active, listings.length - 1);
  const move = (step: number) => {
    const next = (safeActive + step + listings.length) % listings.length;
    setActive(next);
    window.requestAnimationFrame(() => {
      trackRef.current
        ?.querySelector<HTMLElement>(`[data-featured-index="${next}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    });
  };

  return (
    <div className="relative">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
          <span>
            {safeActive + 1} / {listings.length}
          </span>
        </div>
        <div className="flex gap-2">
          <SliderButton onClick={() => move(lang === "ar" ? 1 : -1)}>
            {lang === "ar" ? <FiChevronRight /> : <FiChevronLeft />}
          </SliderButton>
          <SliderButton onClick={() => move(lang === "ar" ? -1 : 1)}>
            {lang === "ar" ? <FiChevronLeft /> : <FiChevronRight />}
          </SliderButton>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            data-featured-index={index}
            className={`min-w-[88%] snap-start transition duration-500 sm:min-w-[48%] xl:min-w-[31.7%] ${
              index === safeActive ? "scale-100 opacity-100" : "scale-[0.985] opacity-90 hover:opacity-100"
            }`}
          >
            <ListingCard listing={listing} elevated={index === safeActive} />
          </div>
        ))}
      </div>

      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${((safeActive + 1) / listings.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function LatestAdditionsPanel({ listings }: { listings: Listing[] }) {
  const { lang, sectors, selectListing, t } = useApp();
  const [active, setActive] = useState(0);
  const current = listings[active % listings.length];

  if (!current) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/5">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[430px] overflow-hidden bg-slate-950">
          <LazyImage
            src={current.images[0]}
            alt={current.title[lang]}
            wrapperClassName="h-full"
            className="h-full min-h-[430px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-amber-200 backdrop-blur">
              <FiClock />
              {t.latestListings}
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight md:text-4xl">{current.title[lang]}</h2>
            <p className="mt-3 line-clamp-2 max-w-xl text-sm font-semibold leading-7 text-slate-200">{current.summary[lang]}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-slate-950">{getSectorTitle(sectors, current.category, lang)}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">{current.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="p-5 md:p-8">
          <div>
            <span className="text-xs font-black uppercase text-emerald-700">{t.latestListings}</span>
            <h3 className="mt-2 text-3xl font-black leading-tight text-slate-950">
              {lang === "ar" ? "أحدث العروض" : "Latest listings"}
            </h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
              {lang === "ar"
                ? "تابع آخر العروض المضافة وتفاصيلها."
                : "Explore the latest listings and their details."}
            </p>
          </div>

          <div className="mt-7 grid gap-3">
            {listings.map((listing, index) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => setActive(index)}
                className={`group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border p-3 text-start transition duration-300 ${
                  index === active
                    ? "border-amber-300 bg-amber-50 shadow-lg shadow-amber-900/10"
                    : "border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-white"
                }`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <strong className="line-clamp-1 text-base font-black text-slate-950">{listing.title[lang]}</strong>
                  <small className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <FiCalendar className="text-amber-600" />
                    {listing.createdAt}
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    {listing.city[lang]}
                  </small>
                </span>
                <FiArrowUpRight className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:text-amber-600" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => selectListing(current.id)}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            {t.viewDetails}
            <FiExternalLink />
          </button>
        </div>
      </div>
    </section>
  );
}

function MostContactedBoard({ listings }: { listings: Listing[] }) {
  const { lang, sectors, selectListing, t } = useApp();
  const topListing = listings[0];
  const maxContacts = Math.max(1, ...listings.map((listing) => listing.whatsappClicks));

  if (!topListing) return null;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(245,158,11,0.22),transparent_28%),radial-gradient(circle_at_80%_72%,rgba(16,185,129,0.14),transparent_24%)]" />
      <div className="relative">
        <SectionHeading
          eyebrow={t.mostContacted}
          title={lang === "ar" ? "الأكثر طلبًا" : "Most requested"}
          subtitle={
            lang === "ar"
              ? "العروض التي تحظى بأكبر اهتمام من الزوار."
              : "Listings receiving the most interest from visitors."
          }
          inverted
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid gap-3">
            {listings.map((listing, index) => {
              const percent = Math.round((listing.whatsappClicks / maxContacts) * 100);
              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => selectListing(listing.id)}
                  className="group rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-start shadow-lg shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-300/70 hover:bg-white/[0.09]"
                >
                  <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">
                      #{index + 1}
                    </span>
                    <span className="min-w-0">
                      <strong className="line-clamp-1 text-lg font-black text-white">{listing.title[lang]}</strong>
                      <small className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
                        <FiMapPin className="text-amber-300" />
                        {listing.city[lang]}
                        <span className="h-1 w-1 rounded-full bg-slate-500" />
                        {getSectorTitle(sectors, listing.category, lang)}
                      </small>
                    </span>
                    <span className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                      <strong className="block text-2xl font-black text-white">
                        {listing.whatsappClicks.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                      </strong>
                      <small className="text-xs font-black text-slate-300">{t.whatsappClicks}</small>
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${percent}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-3 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="relative overflow-hidden rounded-[1.35rem]">
              <LazyImage
                src={topListing.images[0]}
                alt={topListing.title[lang]}
                className="aspect-[1.05] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                  <FiStar />
                  {lang === "ar" ? "الأعلى تواصلا" : "Top contacted"}
                </span>
                <h3 className="mt-4 line-clamp-2 text-2xl font-black leading-tight text-white">{topListing.title[lang]}</h3>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TopRequestedStat value={topListing.views.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} label={lang === "ar" ? "مشاهدة" : "Views"} />
              <TopRequestedStat value={topListing.whatsappClicks.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} label={t.whatsappClicks} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function TopRequestedStat({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-2xl bg-white/10 p-4 text-center">
      <strong className="block text-2xl font-black text-white">{value}</strong>
      <small className="mt-1 block text-xs font-black text-slate-300">{label}</small>
    </span>
  );
}

function HomeAboutPreview() {
  const { lang, t, sectors, aboutContent, navigate } = useApp();
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  const stats = [
    { value: aboutContent.profile.startedYear, label: lang === "ar" ? "بداية المسيرة" : "Established" },
    { value: sectors.length, label: lang === "ar" ? "قطاعات العمل" : "Business sectors" },
    { value: aboutContent.workCategories.length, label: lang === "ar" ? "مجالات سابقة الأعمال" : "Previous work areas" },
  ];

  const strengths = [
    {
      icon: FiShield,
      title: lang === "ar" ? "شفافية في العرض" : "Transparent showcase",
      text: lang === "ar" ? "صور، حالة، موقع، وبيانات مختصرة قبل أي تواصل." : "Photos, status, location, and clear data before contact.",
    },
    {
      icon: FiBriefcase,
      title: lang === "ar" ? "متابعة منظمة" : "Organized follow-up",
      text: lang === "ar" ? "كل مزاد له بيانات تواصل وواتساب وموقع واضح لتسهيل المتابعة." : "Each listing keeps clear contact, WhatsApp, and location data for follow-up.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="grid gap-8 rounded-[2.2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/7 lg:grid-cols-[0.92fr_1.08fr] lg:[direction:ltr] lg:p-6">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-slate-950">
          <LazyImage
            src={heroBackground}
            alt={lang === "ar" ? "فريق الحبشي وخبرة تقييم الأصول" : "El Habashy asset valuation expertise"}
            wrapperClassName="h-full"
            className="h-full min-h-[430px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-amber-200 backdrop-blur">
              <FiMapPin />
              {lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}
            </span>
            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-200">
              {lang === "ar"
                ? "مقر إداري للتواصل، مراجعة المستندات، وترتيب المعاينات مع العملاء والجهات المالكة للأصول."
                : "A contact hub for documents, inspections, and organized asset follow-up."}
            </p>
          </div>
        </div>

        <div dir={lang === "ar" ? "rtl" : "ltr"} className="flex flex-col justify-center p-2 lg:p-6">
          <span className="text-xs font-black uppercase text-emerald-700">{t.about}</span>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
            {lang === "ar"
              ? "خبرة ممتدة في التثمين وإدارة المزادات"
              : "Long-standing expertise in valuation and auction management"}
          </h2>
          <p className="mt-5 text-sm font-semibold leading-8 text-slate-600 md:text-base">
            {lang === "ar"
              ? "تقدم الحبشي خدمات الخبرة والتثمين وإدارة المزادات للأصول العقارية والمنقولة، مع تنظيم المعاينات والمستندات والتواصل مع الأطراف المعنية."
              : "El Habashy provides valuation and auction management for real estate and movable assets, including viewings, documentation, and client coordination."}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <span key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <strong className="block text-3xl font-black text-slate-950">{item.value}</strong>
                <small className="mt-1 block text-xs font-black text-slate-500">{item.label}</small>
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {strengths.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <Icon className="text-amber-600" />
                  <h3 className="mt-3 text-base font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-xs font-bold leading-6 text-slate-500">{item.text}</p>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigate("about")}
            className="mt-7 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-1 hover:bg-slate-800"
          >
            {lang === "ar" ? "رؤية المزيد عن الحبشي" : "Read more about El Habashy"}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactExperience() {
  const { lang, t, settings, navigate, navigateListings } = useApp();
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  const contactCards = [
    { icon: FiPhone, label: lang === "ar" ? "اتصال مباشر" : "Direct phone", value: settings.contactPhone },
    { icon: FaWhatsapp, label: t.whatsapp, value: settings.whatsappNumber, href: `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}` },
    { icon: FiMail, label: t.email, value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: FiMapPin, label: lang === "ar" ? "مقر الشركة" : "Office location", value: settings.officeAddress[lang], href: settings.mapUrl },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <div className="relative overflow-hidden rounded-[2.2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(245,158,11,0.25),transparent_27%),radial-gradient(circle_at_88%_74%,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-xs font-black uppercase text-amber-300">{t.contact}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
              {lang === "ar" ? "تواصل مع فريق الحبشي" : "Contact the El Habashy team"}
            </h2>
            <p className="mt-5 text-sm font-semibold leading-8 text-slate-300">
              {lang === "ar"
                ? "للاستفسار عن العروض أو مواعيد المعاينة والمستندات المطلوبة."
                : "For listing enquiries, viewing dates, and required documents."}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigateListings("all")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-amber-300"
              >
                {t.browseListings}
                <FiSearch />
              </button>
              <button
                type="button"
                onClick={() => navigate("about")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                {t.about}
                <ArrowIcon />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {contactCards.map((item) => {
              const Icon = item.icon;
              const Wrapper = item.href ? "a" : "article";
              return (
                <Wrapper key={item.label} href={item.href} target={item.href ? "_blank" : undefined} rel={item.href ? "noreferrer" : undefined} className="group rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-lg shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-300/60">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
                    <Icon />
                  </span>
                  <small className="mt-5 block text-xs font-black text-amber-200">{item.label}</small>
                  <strong className="mt-1 block break-words text-lg font-black text-white">{item.value}</strong>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
