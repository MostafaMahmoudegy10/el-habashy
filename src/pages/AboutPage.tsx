import type { IconType } from "react-icons";
import {
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiGrid,
  FiLayers,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { LazyImage } from "../components/LazyImage";
import { useApp } from "../context/AppContext";
import type { AboutSection } from "../types";
import heroBackground from "../assets/elhabashy-hero-bg.png";

export function AboutPage() {
  const { aboutContent, aboutSection, lang, listings, settings, t, navigate, navigateAbout } = useApp();
  const sections: Array<{ id: AboutSection; label: string; icon: IconType }> = [
    { id: "profile", label: t.aboutProfile, icon: FiBriefcase },
    { id: "previous-work", label: t.previousWork, icon: FiGrid },
    { id: "certificates", label: t.honorCertificates, icon: FiAward },
    { id: "structure", label: t.organizationStructure, icon: FiUsers },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <LazyImage eager src={heroBackground} alt="" wrapperClassName="h-full opacity-45" className="h-full min-h-[560px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-6 lg:py-24">
          <div>
            <span className="inline-flex rounded-full border border-amber-300/40 bg-white/10 px-4 py-2 text-xs font-black uppercase text-amber-200 backdrop-blur">
              {t.about}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              {lang === "ar"
                ? "نبذة عنا منظمة بنفس روح الموقع الأصلي، لكن قابلة للإدارة."
                : lang === "fr"
                  ? "Un profil d'entreprise structure, inspire du site original et facile a gerer."
                  : "A structured company profile, inspired by the original site and ready to manage."}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-slate-200 md:text-lg">
              {aboutContent.profile[lang]}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigateAbout("previous-work")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-amber-300">
                <FiGrid />
                {t.previousWork}
              </button>
              <button type="button" onClick={() => navigate("listings")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                <FiLayers />
                {t.browseListings}
              </button>
            </div>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroMetric value="1944" label={lang === "ar" ? "بداية الخبرة" : "Started"} />
            <HeroMetric value={aboutContent.workCategories.length} label={t.workCategories} />
            <HeroMetric value={listings.length} label={t.totalListings} />
            <HeroMetric value={aboutContent.certificates.length} label={t.honorCertificates} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 lg:px-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = aboutSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => navigateAbout(section.id)}
                className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black transition ${
                  active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-slate-950"
                }`}
              >
                <Icon />
                {section.label}
              </button>
            );
          })}
        </div>
      </section>

      {aboutSection === "profile" ? <ProfileSection /> : null}
      {aboutSection === "previous-work" ? <PreviousWorkSection /> : null}
      {aboutSection === "certificates" ? <CertificatesSection /> : null}
      {aboutSection === "structure" ? <StructureSection /> : null}

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <div className="grid gap-4 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
          <div>
            <span className="text-xs font-black uppercase text-amber-300">{t.contact}</span>
            <h2 className="mt-2 text-3xl font-black leading-tight">
              {lang === "ar" ? "تواصل مباشر مع فريق الحبشي." : "Direct contact with El Habashy team."}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{settings.officeAddress[lang]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white">
              <FaWhatsapp />
              {t.whatsapp}
            </a>
            {settings.mapUrl ? (
              <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-black text-slate-200 transition hover:bg-white hover:text-slate-950">
                <FiMapPin />
                {t.openLocation}
              </a>
            ) : null}
            <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-black text-slate-200">
              <FiPhone />
              {settings.contactPhone}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

function ProfileSection() {
  const { aboutContent, lang, t } = useApp();
  const pillars = [
    { icon: FiBriefcase, title: lang === "ar" ? "خبرة وتثمين" : "Valuation expertise" },
    { icon: FiLayers, title: lang === "ar" ? "مزادات وبيع منظم" : "Organized auctions" },
    { icon: FiShield, title: lang === "ar" ? "تحكيم وفض منازعات" : "Arbitration support" },
    { icon: FiCheckCircle, title: lang === "ar" ? "إدارة مستندات" : "Document handling" },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
      <div>
        <span className="text-xs font-black uppercase text-amber-700">{t.aboutProfile}</span>
        <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
          {lang === "ar" ? "خبرة وراثة ودراسة منذ 1944." : "Inherited and studied expertise since 1944."}
        </h2>
        <p className="mt-5 text-sm font-semibold leading-8 text-slate-600">{aboutContent.profile[lang]}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-amber-300">
                <Icon />
              </span>
              <h3 className="mt-5 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                {lang === "ar"
                  ? "خبرة عملية في إدارة بيانات الأصول وتجهيز مسارات تواصل واضحة للعملاء."
                  : lang === "fr"
                    ? "Une experience pratique dans l'organisation des actifs et des parcours de contact."
                    : "Practical experience in organizing asset data and clear customer contact paths."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreviousWorkSection() {
  const { aboutContent, lang, t } = useApp();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-black uppercase text-amber-700">{t.previousWork}</span>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
            {lang === "ar" ? "سابقة الأعمال كتصنيفات قابلة للإضافة." : "Previous work as editable categories."}
          </h2>
        </div>
        <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-amber-300">
          {aboutContent.workCategories.length} {t.workCategories}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {aboutContent.workCategories.map((category) => (
          <article key={category.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl font-black text-slate-950">{category.title[lang]}</h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                {category.items.length}
              </span>
            </div>
            <div className="mt-5 grid gap-2">
              {category.items.map((item, index) => (
                <span key={`${category.id}-${index}`} className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-700">
                  <FiCheckCircle className="mt-1 shrink-0 text-emerald-600" />
                  {item[lang]}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CertificatesSection() {
  const { aboutContent, lang, t } = useApp();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <span className="text-xs font-black uppercase text-amber-700">{t.honorCertificates}</span>
      <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
        {lang === "ar" ? "مساحة شهادات التقدير والاعتمادات." : "Recognition and accreditation space."}
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {aboutContent.certificates.map((certificate) => (
          <article key={certificate.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
            {certificate.image ? <LazyImage src={certificate.image} alt={certificate.title[lang]} className="mb-5 aspect-[1.6] w-full rounded-2xl object-cover" /> : null}
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{certificate.date}</span>
            <h3 className="mt-5 text-2xl font-black text-slate-950">{certificate.title[lang]}</h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{certificate.description[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StructureSection() {
  const { aboutContent, lang, t } = useApp();

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-6">
      <div>
        <span className="text-xs font-black uppercase text-amber-700">{t.organizationStructure}</span>
        <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
          {lang === "ar" ? "الأسماء والأقسام الداخلية بشكل واضح." : "Leadership and internal departments, clearly arranged."}
        </h2>
      </div>
      <div className="grid gap-5">
        {aboutContent.structure.image ? <LazyImage src={aboutContent.structure.image} alt={t.organizationStructure} className="max-h-[420px] w-full rounded-[2rem] object-cover shadow-xl" /> : null}
        <StructureBlock title={lang === "ar" ? "الخبراء والمسؤولون" : "Experts and leadership"} items={aboutContent.structure.leaders.map((item) => item[lang])} />
        <StructureBlock title={lang === "ar" ? "الأقسام الداخلية" : "Internal departments"} items={aboutContent.structure.departments.map((item) => item[lang])} />
      </div>
    </section>
  );
}

function StructureBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

function HeroMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
      <strong className="block text-4xl font-black text-white">{value}</strong>
      <small className="mt-2 block text-xs font-black text-slate-300">{label}</small>
    </span>
  );
}
