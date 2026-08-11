import {
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiCompass,
  FiLayers,
  FiMapPin,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import type { ReactNode } from "react";
import { LazyImage } from "../components/LazyImage";
import { useApp } from "../context/AppContext";
import type { AboutSection, LocalizedText } from "../types";

const sectionMeta: Record<AboutSection, { icon: typeof FiUsers; ar: string; en: string }> = {
  profile: { icon: FiCompass, ar: "نبذة عن الشركة", en: "Company profile" },
  "previous-work": { icon: FiBriefcase, ar: "سابقة الأعمال", en: "Previous work" },
  certificates: { icon: FiAward, ar: "شهادات التقدير", en: "Certificates" },
  structure: { icon: FiUsers, ar: "الهيكل التنظيمي", en: "Organization" },
};

function text(value: LocalizedText, lang: "ar" | "en") {
  return value[lang] || value.ar || value.en;
}

export function AboutPage() {
  const {
    aboutContent,
    aboutError,
    aboutLoading,
    aboutSection,
    lang,
    navigateAbout,
  } = useApp();
  const isArabic = lang === "ar";
  const profile = aboutContent.profile;

  return (
    <main className="overflow-hidden bg-[#f7f7f3] text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#072f24] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_20%,#d3af67_0,transparent_28%),radial-gradient(circle_at_85%_80%,#15805f_0,transparent_32%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d3af67]/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d3af67]/40 bg-white/5 px-4 py-2 text-xs font-black tracking-[0.18em] text-[#efd99e]">
              <FiCheckCircle /> {isArabic ? `خبرة منذ ${profile.startedYear}` : `Trusted since ${profile.startedYear}`}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.25] sm:text-5xl lg:text-6xl">
              {text(profile.headline, lang)}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-emerald-50/75 sm:text-lg">
              {text(profile.profile, lang)}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(sectionMeta) as AboutSection[]).map((section) => {
              const item = sectionMeta[section];
              const Icon = item.icon;
              const active = aboutSection === section;
              return (
                <button
                  type="button"
                  key={section}
                  onClick={() => navigateAbout(section)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-start text-sm font-black transition ${
                    active
                      ? "border-[#d3af67] bg-[#d3af67] text-[#092e24] shadow-xl shadow-black/20"
                      : "border-white/15 bg-white/5 text-white hover:border-[#d3af67]/60 hover:bg-white/10"
                  }`}
                >
                  <Icon className="text-lg" />
                  {isArabic ? item.ar : item.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {aboutLoading ? <AboutSkeleton /> : null}
      {!aboutLoading && aboutError ? (
        <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-12">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
            {aboutError}
          </div>
        </div>
      ) : null}
      {!aboutLoading && aboutSection === "profile" ? <ProfileSection /> : null}
      {!aboutLoading && aboutSection === "previous-work" ? <PreviousWorkSection /> : null}
      {!aboutLoading && aboutSection === "certificates" ? <CertificatesSection /> : null}
      {!aboutLoading && aboutSection === "structure" ? <OrganizationSection /> : null}
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a67c31]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-[#082f25] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

function ProfileSection() {
  const { aboutContent, lang } = useApp();
  const profile = aboutContent.profile;
  const isArabic = lang === "ar";
  const years = Math.max(1, new Date().getFullYear() - profile.startedYear);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#0a3b2d] shadow-2xl shadow-emerald-950/15">
          {profile.imageUrl ? (
            <LazyImage src={profile.imageUrl} alt={text(profile.headline, lang)} className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#062b21] via-[#062b21]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
            <p className="text-5xl font-black text-[#ebd28f]">+{years}</p>
            <p className="mt-2 text-sm font-black tracking-wide text-white/85">
              {isArabic ? "عامًا من الخبرة المتراكمة" : "years of accumulated expertise"}
            </p>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-950/5 sm:p-10">
          <SectionHeading
            eyebrow={isArabic ? "قصتنا" : "Our story"}
            title={text(profile.headline, lang)}
            description={text(profile.profile, lang)}
          />
          <div className="mt-9 grid gap-4">
            <ValueCard icon={FiTarget} title={isArabic ? "رسالتنا" : "Our mission"} body={text(profile.mission, lang)} />
            <ValueCard icon={FiCompass} title={isArabic ? "رؤيتنا" : "Our vision"} body={text(profile.vision, lang)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon: Icon, title, body }: { icon: typeof FiTarget; title: string; body: string }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-emerald-900/10 bg-[#f4f7f3] p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0a4b38] text-lg text-[#efd99e]"><Icon /></span>
      <div>
        <h3 className="font-black text-[#0a3b2d]">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{body}</p>
      </div>
    </article>
  );
}

function PreviousWorkSection() {
  const { aboutContent, lang } = useApp();
  const isArabic = lang === "ar";
  const projects = aboutContent.workCategories.reduce((total, category) => total + category.entries.length, 0);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionHeading
          eyebrow={isArabic ? "خبرات موثقة" : "Documented expertise"}
          title={isArabic ? "سابقة أعمال بتفاصيلها" : "Previous work, with the details that matter"}
          description={isArabic ? "كل مشروع يعرض الجهة والموقع والسنة ونطاق العمل، بدل الاكتفاء بقائمة أسماء غير واضحة." : "Every project includes its client, location, year and scope—not just an unexplained list of names."}
        />
        <div className="shrink-0 rounded-2xl bg-[#0a3b2d] px-6 py-4 text-white">
          <strong className="text-3xl text-[#ebd28f]">{projects}</strong>
          <span className="ms-2 text-sm font-bold text-white/75">{isArabic ? "مشروعًا" : "projects"}</span>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {aboutContent.workCategories.map((category) => (
          <div key={category.id}>
            <div className="mb-6 flex items-start gap-4 border-b border-slate-200 pb-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#d3af67]/20 text-xl text-[#8a6425]"><FiLayers /></span>
              <div>
                <h3 className="text-2xl font-black text-[#082f25]">{text(category.title, lang)}</h3>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">{text(category.summary, lang)}</p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {category.entries.map((entry) => (
                <article key={entry.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-950/5">
                  {entry.imageUrl ? (
                    <LazyImage src={entry.imageUrl} alt={text(entry.title, lang)} className="aspect-[16/8] w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="grid aspect-[16/6] place-items-center bg-gradient-to-br from-[#0a4b38] to-[#072f24] text-4xl text-[#d3af67]"><FiBriefcase /></div>
                  )}
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-wrap gap-2 text-xs font-black text-[#0a4b38]">
                      {entry.projectYear ? <Meta icon={FiCalendar}>{entry.projectYear}</Meta> : null}
                      {text(entry.location, lang) ? <Meta icon={FiMapPin}>{text(entry.location, lang)}</Meta> : null}
                    </div>
                    <h4 className="mt-4 text-xl font-black leading-snug text-slate-950">{text(entry.title, lang)}</h4>
                    <p className="mt-2 text-sm font-black text-[#9a712c]">{text(entry.client, lang)}</p>
                    <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{text(entry.summary, lang)}</p>
                    <div className="mt-5 border-t border-slate-100 pt-5 text-sm font-medium leading-7 text-slate-500">{text(entry.details, lang)}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        {!aboutContent.workCategories.length ? <EmptyState label={isArabic ? "لم تُضف سابقة أعمال بعد." : "No previous work has been added yet."} /> : null}
      </div>
    </section>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof FiCalendar; children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5"><Icon />{children}</span>;
}

function CertificatesSection() {
  const { aboutContent, lang } = useApp();
  const isArabic = lang === "ar";
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <SectionHeading
        eyebrow={isArabic ? "تقدير وثقة" : "Recognition and trust"}
        title={isArabic ? "شهادات التقدير" : "Certificates and recognition"}
        description={isArabic ? "عرض بصري واضح لكل شهادة، مع الجهة المانحة والتاريخ ووصف سبب التكريم." : "A clear visual record of every certificate, including issuer, date and the reason for recognition."}
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {aboutContent.certificates.map((certificate) => (
          <article key={certificate.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
            <div className="relative bg-[#0a3b2d]">
              {certificate.imageUrl ? (
                <LazyImage src={certificate.imageUrl} alt={text(certificate.title, lang)} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center text-6xl text-[#d3af67]"><FiAward /></div>
              )}
              <span className="absolute bottom-4 end-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#d3af67] text-xl text-[#082f25] shadow-lg"><FiAward /></span>
            </div>
            <div className="p-6">
              {certificate.issueDate ? <p className="text-xs font-black tracking-widest text-[#9a712c]">{certificate.issueDate.slice(0, 4)}</p> : null}
              <h3 className="mt-2 text-xl font-black leading-snug text-[#082f25]">{text(certificate.title, lang)}</h3>
              <p className="mt-3 text-sm font-black text-slate-500">{text(certificate.issuer, lang)}</p>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{text(certificate.description, lang)}</p>
            </div>
          </article>
        ))}
      </div>
      {!aboutContent.certificates.length ? <div className="mt-10"><EmptyState label={isArabic ? "لم تُضف شهادات بعد." : "No certificates have been added yet."} /></div> : null}
    </section>
  );
}

function OrganizationSection() {
  const { aboutContent, lang } = useApp();
  const isArabic = lang === "ar";
  const people = aboutContent.people.filter((person) => person.active);
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <SectionHeading
        eyebrow={isArabic ? "فريق العمل" : "Our team"}
        title={isArabic ? "هيكل تنظيمي واضح وقابل للتوسع" : "A clear, scalable organization"}
        description={isArabic ? "كل خبير له دوره ونبذته وصورته، ويمكن إضافة أعضاء وأقسام جديدة من لوحة التحكم في أي وقت." : "Every expert has a role, biography and photo, while new people and departments can be added at any time."}
      />

      <div className="relative mt-12">
        <div className="absolute bottom-[-30px] left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[#d3af67]/50 lg:block" />
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people.map((person, index) => (
            <article key={person.id} className={`relative overflow-hidden rounded-[1.75rem] border bg-white shadow-xl shadow-slate-950/5 ${index === 0 ? "border-[#c59d4d] lg:col-span-2 xl:col-span-2" : "border-slate-200"}`}>
              <div className={`grid ${index === 0 ? "sm:grid-cols-[180px_1fr]" : ""}`}>
                {person.imageUrl ? (
                  <LazyImage src={person.imageUrl} alt={text(person.name, lang)} className={`${index === 0 ? "h-64 sm:h-full" : "aspect-[4/3]"} w-full object-cover object-top`} />
                ) : (
                  <div className={`${index === 0 ? "h-64 sm:h-full" : "aspect-[4/3]"} grid place-items-center bg-gradient-to-br from-[#0b503c] to-[#072f24] text-5xl font-black text-[#e1c477]`}>
                    {text(person.name, lang).trim().charAt(0)}
                  </div>
                )}
                <div className="p-6">
                  <span className="text-xs font-black uppercase tracking-wider text-[#9a712c]">{text(person.role, lang)}</span>
                  <h3 className="mt-2 text-xl font-black text-[#082f25]">{text(person.name, lang)}</h3>
                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{text(person.biography, lang)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="relative mt-16 rounded-[2rem] bg-[#082f25] p-6 text-white sm:p-9">
        <div className="absolute left-1/2 top-[-34px] hidden h-[34px] w-px -translate-x-1/2 bg-[#d3af67]/70 lg:block" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d3af67] text-[#082f25]"><FiLayers /></span>
          <h3 className="text-xl font-black">{isArabic ? "الإدارات والقطاعات المتخصصة" : "Specialized departments and sectors"}</h3>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutContent.departments.map((department) => (
            <article key={department.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="font-black text-[#efd99e]">{text(department.title, lang)}</h4>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{text(department.description, lang)}</p>
            </article>
          ))}
        </div>
      </div>
      {!people.length && !aboutContent.departments.length ? <div className="mt-10"><EmptyState label={isArabic ? "لم يُضف الهيكل التنظيمي بعد." : "The organization has not been added yet."} /></div> : null}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm font-bold text-slate-500">{label}</div>;
}

function AboutSkeleton() {
  return (
    <section className="mx-auto max-w-7xl animate-pulse px-5 py-16 sm:px-8 lg:px-12">
      <div className="h-6 w-40 rounded bg-slate-200" />
      <div className="mt-4 h-10 max-w-xl rounded bg-slate-200" />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-[2rem] bg-slate-200" />
        <div className="h-96 rounded-[2rem] bg-slate-200" />
      </div>
    </section>
  );
}
