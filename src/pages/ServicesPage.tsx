import { FiArrowLeft, FiArrowRight, FiBriefcase, FiFileText, FiShield } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { LazyImage } from "../components/LazyImage";
import { RichContent } from "../components/RichContent";
import type { ServiceKind } from "../types";

const kindInfo: Record<ServiceKind, { ar: string; en: string; icon: typeof FiShield }> = {
  arbitration: { ar: "قطاعات التحكيم", en: "Arbitration sectors", icon: FiShield },
  valuation: { ar: "التقييمات ودراسات الجدوى", en: "Valuation & feasibility", icon: FiFileText },
  consulting: { ar: "الاستشارات", en: "Consulting", icon: FiBriefcase },
};

export function ServicesPage() {
  const { lang, services, selectService } = useApp();
  const Arrow = lang === "ar" ? FiArrowLeft : FiArrowRight;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="max-w-3xl">
        <span className="text-xs font-black uppercase text-amber-700">{lang === "ar" ? "خبراتنا" : "Our expertise"}</span>
        <h1 className="mt-3 text-4xl font-black text-slate-950 md:text-6xl">{lang === "ar" ? "الخدمات وقطاعات التحكيم" : "Services & arbitration sectors"}</h1>
        <p className="mt-5 text-base font-semibold leading-8 text-slate-600">{lang === "ar" ? "خدمات متخصصة تدعم القرار وتحفظ القيمة الاستثمارية للأصول." : "Specialist services that support decisions and protect asset value."}</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const info = kindInfo[service.kind]; const Icon = info.icon;
          return <article key={service.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
            <div className="relative overflow-hidden"><LazyImage src={service.image} alt={service.title[lang]} className="aspect-[1.45] w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-2 text-xs font-black text-white backdrop-blur"><Icon className="text-amber-300" />{lang === "ar" ? info.ar : info.en}</span></div>
            <div className="p-5"><h2 className="text-2xl font-black text-slate-950">{service.title[lang]}</h2><p className="mt-3 line-clamp-3 text-sm font-semibold leading-7 text-slate-600">{service.summary[lang]}</p><button onClick={() => selectService(service.id)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white">{lang === "ar" ? "عرض التفاصيل" : "View details"}<Arrow /></button></div>
          </article>;
        })}
      </div>
    </section>
  );
}

export function ServiceDetailsPage() {
  const { lang, selectedService, navigate } = useApp();
  if (!selectedService) return null;
  const info = kindInfo[selectedService.kind]; const Icon = info.icon;
  return <article>
    <section className="relative overflow-hidden bg-slate-950 text-white"><LazyImage eager src={selectedService.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" wrapperClassName="absolute inset-0" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" /><div className="relative mx-auto max-w-5xl px-4 py-20 lg:px-6"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-amber-200"><Icon />{lang === "ar" ? info.ar : info.en}</span><h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{selectedService.title[lang]}</h1><p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-200">{selectedService.summary[lang]}</p></div></section>
    <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 md:p-10"><RichContent value={selectedService.content[lang]} /></div>{selectedService.gallery?.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{selectedService.gallery.map((image, index) => <LazyImage key={index} src={image} alt="" className="aspect-[1.3] w-full rounded-3xl object-cover" />)}</div> : null}<button onClick={() => navigate("home")} className="mt-6 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black">{lang === "ar" ? "العودة للرئيسية" : "Back home"}</button></section>
  </article>;
}
