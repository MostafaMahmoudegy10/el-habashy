import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-3xl animate-fade-up">
        <span className="text-sm font-black uppercase text-amber-700">{eyebrow}</span>
        <h2 className="mt-2 text-3xl font-black leading-tight tracking-normal text-slate-950 md:text-4xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
