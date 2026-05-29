import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { LazyImage } from "../components/LazyImage";
import { SectionHeading } from "../components/SectionHeading";
import { useApp } from "../context/AppContext";
import heroBackground from "../assets/elhabashy-hero-bg.png";

export function AboutPage() {
  const { lang, t, listings, requests, navigate } = useApp();
  const ArrowIcon = lang === "ar" ? FiArrowLeft : FiArrowRight;

  const stats = [
    { value: "15+", label: lang === "ar" ? "سنة خبرة في التقييم" : "Years in valuation" },
    { value: "120+", label: lang === "ar" ? "مزايدة وملف أصل" : "Auctions and asset files" },
    { value: "4", label: lang === "ar" ? "قطاعات رئيسية" : "Core sectors" },
    { value: requests.length.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), label: t.bookletRequests },
  ];

  const timeline = [
    {
      year: "2009",
      title: lang === "ar" ? "بداية العمل في تقييم الأصول" : "Started asset valuation work",
      text: lang === "ar" ? "تكوين خبرة ميدانية في فحص الأصول وتجهيز بياناتها للجهات المالكة والعملاء." : "Built practical experience in asset inspection and owner-ready documentation.",
    },
    {
      year: "2014",
      title: lang === "ar" ? "تنظيم مزايدات وملفات شروط" : "Auction and booklet operations",
      text: lang === "ar" ? "تطوير طريقة أوضح لعرض المستندات، مواعيد المعاينة، واشتراطات المشاركة." : "Improved how documents, viewing schedules, and participation terms are presented.",
    },
    {
      year: "2019",
      title: lang === "ar" ? "أرشفة رقمية للصور والبيانات" : "Digital visual archive",
      text: lang === "ar" ? "تجميع الصور، المواصفات، وحالات الأصول في ملفات سهلة المراجعة والمتابعة." : "Moved photos, specs, and asset statuses into easier review flows.",
    },
    {
      year: "2026",
      title: lang === "ar" ? "منصة عرض حديثة للحبشي" : "Modern El Habashy showcase",
      text: lang === "ar" ? "تجربة عامة ثنائية اللغة لعرض الأصول وطلب كراسة الشروط بدون مزايدة أونلاين." : "A bilingual showcase for listings and booklet requests without online bidding.",
    },
  ];

  const sectors = [
    { icon: FiBriefcase, title: lang === "ar" ? "عقارات" : "Real estate" },
    { icon: FiTrendingUp, title: lang === "ar" ? "سيارات وأساطيل" : "Cars and fleets" },
    { icon: FiAward, title: lang === "ar" ? "أنتيكات ومقتنيات" : "Antiques" },
    { icon: FiShield, title: lang === "ar" ? "سكراب ومخلفات" : "Scrap assets" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <LazyImage
            eager
            src={heroBackground}
            alt=""
            wrapperClassName="h-full opacity-45"
            className="h-full min-h-[620px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/35" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[1fr_0.8fr] lg:px-6 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full border border-amber-300/40 bg-white/10 px-4 py-2 text-xs font-black uppercase text-amber-200 backdrop-blur">
              {t.about}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] md:text-6xl">
              {lang === "ar" ? "الحبشي خبرة تقييم ومزايدات تتحول لتجربة عرض واضحة." : "El Habashy turns valuation and auction experience into a clear showcase."}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-slate-200 md:text-lg">
              {lang === "ar"
                ? "نساعد العملاء والجهات المالكة على عرض الأصول بشكل محترف: صور واضحة، مواصفات مختصرة، حالات دقيقة، وطلب كراسة شروط منظم."
                : "We help owners and customers present assets professionally with clear visuals, concise specs, accurate statuses, and structured booklet requests."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("listings")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-amber-300"
              >
                {t.browseListings}
                <ArrowIcon />
              </button>
              <button
                type="button"
                onClick={() => navigate("home")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                {t.contact}
                <FiPhone />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-end">
            {stats.map((item) => (
              <span key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <strong className="block text-4xl font-black text-white">{item.value}</strong>
                <small className="mt-2 block text-xs font-black text-slate-300">{item.label}</small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <SectionHeading
          eyebrow={lang === "ar" ? "القصة" : "Story"}
          title={lang === "ar" ? "من الفحص الميداني لعرض رقمي منظم" : "From field inspection to a polished digital experience"}
          subtitle={
            lang === "ar"
              ? "صفحة من نحن هنا معمولة كصفحة تعريف حقيقية: تاريخ، قطاعات، أرقام، وموقع واضح للشركة."
              : "This page presents the company story, sectors, numbers, and office location in a proper brand page."
          }
        />
        <div className="grid gap-4 md:grid-cols-4">
          {timeline.map((item) => (
            <article key={item.year} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 transition duration-300 hover:-translate-y-1 hover:border-amber-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-amber-300">
                <FiClock />
                {item.year}
              </span>
              <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
          <div>
            <SectionHeading
              eyebrow={lang === "ar" ? "طريقة العمل" : "How we work"}
              title={lang === "ar" ? "تنظيم العرض قبل التواصل" : "Organized before the first call"}
              subtitle={
                lang === "ar"
                  ? "كل أصل يحتاج وضوح: بيانات، صور، حالة، مدينة، وطلب كراسة شروط له مسار محدد."
                  : "Every asset needs clarity: data, photos, status, city, and a defined booklet request path."
              }
            />
            <div className="grid gap-3">
              {[
                lang === "ar" ? "تجهيز الصور والبيانات الأساسية للأصل." : "Prepare asset photos and core data.",
                lang === "ar" ? "عرض الحالة والمدينة والقيمة التقديرية بشكل واضح." : "Show status, city, and estimated value clearly.",
                lang === "ar" ? "استقبال طلبات كراسة الشروط ومرفقات العملاء." : "Receive booklet requests and customer files.",
                lang === "ar" ? "متابعة الطلب داخليًا حتى التواصل أو إرسال المستند." : "Track requests internally until contact or document delivery.",
              ].map((item) => (
                <span key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-black leading-7 text-slate-700 shadow-sm">
                  <FiCheckCircle className="mt-1 shrink-0 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              return (
                <article key={sector.title} className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-400 text-slate-950">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{sector.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                    {lang === "ar"
                      ? "عرض بصري واضح مع بيانات كافية لاتخاذ خطوة طلب الكراسة."
                      : "A visual showcase with enough data to request the booklet confidently."}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid gap-8 rounded-[2.2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/7 lg:grid-cols-[1fr_0.9fr] lg:p-8">
          <div>
            <span className="text-xs font-black uppercase text-emerald-700">{lang === "ar" ? "مقر الشركة" : "Office"}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
              {lang === "ar" ? "موقع واضح للتواصل وترتيب المعاينات" : "A clear location for contact and viewings"}
            </h2>
            <p className="mt-5 text-sm font-semibold leading-8 text-slate-600">
              {lang === "ar"
                ? "يمكن استخدام هذا الجزء لاحقًا لربط Google Maps الحقيقي، أما الآن فهو يوضح مكان الشركة وطرق التواصل الأساسية بشكل محترم."
                : "This block can later connect to the real Google Maps link. For now it gives the company location and contact routes a premium layout."}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { icon: FiMapPin, label: lang === "ar" ? "العنوان" : "Address", value: lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt" },
                { icon: FiPhone, label: lang === "ar" ? "الهاتف" : "Phone", value: "+20 100 000 0000" },
                { icon: FaWhatsapp, label: t.whatsapp, value: "+20 100 000 0000" },
                { icon: FiFileText, label: t.requestBooklet, value: lang === "ar" ? "من صفحة العرض" : "From listing page" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <Icon className="text-amber-600" />
                    <small className="mt-4 block text-xs font-black text-slate-500">{item.label}</small>
                    <strong className="mt-1 block text-base font-black text-slate-950">{item.value}</strong>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[1.8rem] bg-slate-950 p-5 text-white">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative flex h-full min-h-[320px] flex-col justify-between rounded-[1.4rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-400 text-slate-950 shadow-2xl shadow-amber-950/30">
                <FiMapPin size={28} />
              </span>
              <div>
                <h3 className="text-3xl font-black">{lang === "ar" ? "El Habashy HQ" : "El Habashy HQ"}</h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                  {lang === "ar"
                    ? "نقطة التواصل الرسمية لمراجعة الطلبات والمستندات وتنسيق المعاينات."
                    : "The official contact point for requests, documents, and inspection coordination."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-black uppercase text-amber-300">{listings.length} {t.listings}</span>
              <h2 className="mt-2 text-3xl font-black leading-tight">
                {lang === "ar" ? "ابدأ من العروض الحالية واطلب الكراسة المناسبة." : "Start with current listings and request the right booklet."}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("listings")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-amber-300"
            >
              {t.browseListings}
              <ArrowIcon />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
