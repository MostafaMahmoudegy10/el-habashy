import { FaCarSide, FaGem, FaRecycle } from "react-icons/fa6";
import { FiCheckCircle, FiFileText, FiShield } from "react-icons/fi";
import { Brand } from "../components/Brand";
import { SectionHeading } from "../components/SectionHeading";
import { useApp } from "../context/AppContext";

export function AboutPage() {
  const { lang, t } = useApp();
  const points = [
    { icon: FiCheckCircle, text: t.aboutPoint1 },
    { icon: FiFileText, text: t.aboutPoint2 },
    { icon: FiShield, text: t.aboutPoint3 },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <SectionHeading eyebrow={t.about} title={t.aboutTitle} subtitle={t.aboutText} />
          <div className="grid gap-3 md:grid-cols-3">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.text} className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
                  <Icon className="text-amber-600" size={22} />
                  <strong className="mt-3 block text-sm font-black leading-6">{point.text}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Brand />
          <div className="mt-5 grid grid-cols-3 gap-3">
            <CategoryChip icon={FaCarSide} label={lang === "ar" ? "سيارات" : "Cars"} />
            <CategoryChip icon={FaGem} label={lang === "ar" ? "أنتيكات" : "Antiques"} />
            <CategoryChip icon={FaRecycle} label={lang === "ar" ? "سكراب" : "Scrap"} />
          </div>
          <p className="mt-5 text-sm font-semibold leading-7 text-slate-500">
            {lang === "ar"
              ? "الهدف من الواجهة إن العميل يوصل للمعلومة بسرعة، ويتواصل فوراً مع الإدارة على واتساب بدون خطوات كتير."
              : "The goal is to help customers reach information quickly and contact the team on WhatsApp without extra steps."}
          </p>
        </div>
      </div>
    </section>
  );
}

function CategoryChip({ icon: Icon, label }: { icon: typeof FaCarSide; label: string }) {
  return (
    <div className="grid place-items-center rounded-lg bg-stone-50 p-4 text-center">
      <Icon className="text-amber-600" size={22} />
      <span className="mt-2 text-xs font-black text-slate-700">{label}</span>
    </div>
  );
}
