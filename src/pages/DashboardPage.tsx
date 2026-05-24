import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiBarChart2,
  FiEye,
  FiPlus,
  FiStar,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { categoryLabel, statusLabel } from "../lib/i18n";
import { useApp } from "../context/AppContext";
import { SectionHeading } from "../components/SectionHeading";
import type { ListingCategory, ListingDraft, ListingStatus } from "../types";

const initialDraft: ListingDraft = {
  titleAr: "",
  titleEn: "",
  category: "real-estate",
  status: "active",
  cityAr: "",
  cityEn: "",
  areaAr: "",
  areaEn: "",
  priceLabelAr: "",
  priceLabelEn: "",
  measureLabel: "",
  image: "",
  featured: false,
};

export function DashboardPage() {
  const {
    lang,
    t,
    listings,
    subscribers,
    addListing,
    updateListingStatus,
    toggleFeatured,
    deleteListing,
    selectListing,
  } = useApp();
  const [draft, setDraft] = useState<ListingDraft>(initialDraft);
  const [tab, setTab] = useState<"add" | "manage">("add");

  const totalVisits = listings.reduce((sum, listing) => sum + listing.visits, 0);
  const totalBooklet = listings.reduce((sum, listing) => sum + listing.bookletClicks, 0);
  const totalWhatsapp = listings.reduce((sum, listing) => sum + listing.whatsappClicks, 0);
  const active = listings.filter((listing) => listing.status === "active").length;
  const ended = listings.filter((listing) => listing.status === "ended").length;
  const topListings = useMemo(
    () => [...listings].sort((a, b) => b.bookletClicks - a.bookletClicks).slice(0, 4),
    [listings],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addListing(draft);
    setDraft(initialDraft);
    setTab("manage");
  };

  const patchDraft = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:px-6">
      <div className="rounded-lg bg-slate-950 p-5 text-white shadow-soft">
        <SectionHeading
          eyebrow={t.dashboard}
          title={t.dashboardTitle}
          subtitle={t.dashboardText}
          action={
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setTab("add")}
                className={`h-10 rounded-lg px-4 text-sm font-black ${tab === "add" ? "bg-amber-400 text-slate-950" : "text-white"}`}
              >
                {t.addListing}
              </button>
              <button
                type="button"
                onClick={() => setTab("manage")}
                className={`h-10 rounded-lg px-4 text-sm font-black ${tab === "manage" ? "bg-amber-400 text-slate-950" : "text-white"}`}
              >
                {t.manageListings}
              </button>
            </div>
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={FiBarChart2} label={t.totalListings} value={listings.length} />
        <Stat icon={FiTrendingUp} label={t.activeListings} value={active} tone="emerald" />
        <Stat icon={FiEye} label={t.endedListings} value={ended} tone="slate" />
        <Stat icon={FaWhatsapp} label={t.whatsappClicks} value={totalWhatsapp} tone="emerald" />
        <Stat icon={FiStar} label={t.bookletClicks} value={totalBooklet} tone="amber" />
      </div>

      {tab === "add" ? (
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <FiPlus className="text-amber-600" />
            <h2 className="text-xl font-black">{t.newListing}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label={t.titleAr} value={draft.titleAr} onChange={(value) => patchDraft("titleAr", value)} required />
            <Field label={t.titleEn} value={draft.titleEn} onChange={(value) => patchDraft("titleEn", value)} />
            <SelectField
              label={t.category}
              value={draft.category}
              onChange={(value) => patchDraft("category", value as ListingCategory)}
            >
              {(Object.keys(categoryLabel) as ListingCategory[]).map((item) => (
                <option key={item} value={item}>
                  {categoryLabel[item][lang]}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={t.status}
              value={draft.status}
              onChange={(value) => patchDraft("status", value as ListingStatus)}
            >
              {(Object.keys(statusLabel) as ListingStatus[]).map((item) => (
                <option key={item} value={item}>
                  {statusLabel[item][lang]}
                </option>
              ))}
            </SelectField>
            <Field label={t.cityAr} value={draft.cityAr} onChange={(value) => patchDraft("cityAr", value)} required />
            <Field label={t.cityEn} value={draft.cityEn} onChange={(value) => patchDraft("cityEn", value)} />
            <Field label={t.areaAr} value={draft.areaAr} onChange={(value) => patchDraft("areaAr", value)} required />
            <Field label={t.areaEn} value={draft.areaEn} onChange={(value) => patchDraft("areaEn", value)} />
            <Field label={t.priceAr} value={draft.priceLabelAr} onChange={(value) => patchDraft("priceLabelAr", value)} required />
            <Field label={t.priceEn} value={draft.priceLabelEn} onChange={(value) => patchDraft("priceLabelEn", value)} />
            <Field label={t.measure} value={draft.measureLabel} onChange={(value) => patchDraft("measureLabel", value)} required />
            <Field label={t.imageUrl} value={draft.image} onChange={(value) => patchDraft("image", value)} />
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-black text-slate-600">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => patchDraft("featured", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {t.featured}
            </label>
            <button className="h-11 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950" type="submit">
              {t.saveListing}
            </button>
          </div>
        </form>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">{t.manageListings}</h2>
            <span className="text-sm font-black text-slate-500">{listings.length}</span>
          </div>
          <div className="grid gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 lg:grid-cols-[90px_minmax(0,1fr)_auto] lg:items-center"
              >
                <img src={listing.images[0]} alt={listing.title[lang]} className="h-24 w-full rounded-lg object-cover lg:w-24" />
                <div>
                  <strong className="line-clamp-1 font-black">{listing.title[lang]}</strong>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span>{categoryLabel[listing.category][lang]}</span>
                    <span>{listing.city[lang]}</span>
                    <span>{listing.whatsappClicks} {t.whatsappClicks}</span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  <select
                    value={listing.status}
                    onChange={(event) => updateListingStatus(listing.id, event.target.value as ListingStatus)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold"
                  >
                    {(Object.keys(statusLabel) as ListingStatus[]).map((item) => (
                      <option key={item} value={item}>
                        {statusLabel[item][lang]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(listing.id)}
                    className={`h-10 rounded-lg border px-3 text-sm font-black ${
                      listing.featured ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {t.featured}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectListing(listing.id)}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-600"
                  >
                    {t.details}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteListing(listing.id)}
                    className="grid h-10 place-items-center rounded-lg border border-rose-200 text-rose-700"
                    aria-label="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="mb-4 text-xl font-black">{t.analytics}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label={t.visits} value={totalVisits} />
            <Metric label={t.bookletClicks} value={totalBooklet} />
            <Metric label={t.whatsappClicks} value={totalWhatsapp} />
          </div>
          <div className="mt-5 grid gap-3">
            {topListings.map((listing) => (
              <div key={listing.id}>
                <div className="mb-1 flex justify-between gap-3 text-xs font-bold text-slate-600">
                  <span className="line-clamp-1">{listing.title[lang]}</span>
                  <span>{listing.bookletClicks}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(listing.bookletClicks, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="mb-4 text-xl font-black">{t.subscribers}</h2>
          <div className="grid gap-3">
            {subscribers.map((subscriber) => (
              <div key={subscriber.id} className="rounded-lg border border-slate-200 p-3">
                <strong className="block font-black">{subscriber.name}</strong>
                <span className="mt-1 block text-sm font-bold text-slate-500">{subscriber.email}</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">{subscriber.city}</span>
                  <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">
                    {categoryLabel[subscriber.category][lang]}
                  </span>
                  <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">{subscriber.budget}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-600">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none focus:border-amber-400"
      >
        {children}
      </select>
    </label>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "amber",
}: {
  icon: typeof FiBarChart2;
  label: string;
  value: number;
  tone?: "amber" | "emerald" | "slate";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${colors[tone]}`}>
        <Icon />
      </span>
      <strong className="mt-4 block text-2xl font-black">{value}</strong>
      <span className="mt-1 block text-xs font-black text-slate-500">{label}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <strong className="mt-1 block text-2xl font-black">{value.toLocaleString()}</strong>
    </div>
  );
}
