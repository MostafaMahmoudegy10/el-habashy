import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  inverted?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <span className={`text-xs font-black uppercase ${inverted ? "text-emerald-300" : "text-emerald-700"}`}>
          {eyebrow}
        </span>
        <h2 className={`mt-2 text-3xl font-black leading-tight tracking-normal md:text-4xl ${inverted ? "text-white" : "text-zinc-950"}`}>
          {title}
        </h2>
        {subtitle ? (
          <p className={`mt-3 text-sm font-semibold leading-7 ${inverted ? "text-slate-300" : "text-slate-500"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
