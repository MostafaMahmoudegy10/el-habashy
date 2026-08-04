import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFolderPlus,
  FiGrid,
  FiLayers,
  FiLoader,
  FiMapPin,
  FiPlus,
  FiSave,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { statusLabel } from "../lib/i18n";
import { categoryIcon } from "../lib/icons";
import { getSectorTitle } from "../lib/sectors";
import { listingToDraft, useApp } from "../context/AppContext";
import { LazyImage } from "../components/LazyImage";
import { RichTextEditor } from "../components/RichTextEditor";
import type { AboutContent, AppSettings, Certificate, DashboardView, Listing, ListingCategory, ListingDraft, ListingMedia, ListingMediaRole, ListingStatus, Sector, WorkCategory, ServiceArticle, ServiceDraft, ServiceKind } from "../types";
import { useAuth } from "../context/AuthContext";
import type { AuthUser, PageResponse, UserRole } from "../lib/authApi";
import { ApiError } from "../lib/api";
import { mediaContentType } from "../lib/listingMediaApi";

function requestError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const fields = Object.entries(error.errors).map(([field, message]) => `${field}: ${message}`);
    return fields.length ? `${error.message} — ${fields.join("، ")}` : error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

async function readImages(files: FileList | null) {
  const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
  return Promise.all(
    imageFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function DashboardPage() {
  const {
    lang,
    t,
    adminListings: listings,
    adminListingsLoading,
    adminListingsError,
    reloadAdminListings,
    reloadContent,
    sectorsLoading,
    sectorsError,
    settings,
    aboutContent,
    sectors,
    services,
    dashboardView,
    setDashboardView,
    selectListing,
    addListing,
    updateListing,
    deleteListing,
    updateListingStatus,
    updateSettings,
    updateSector,
    addWorkCategory,
    updateWorkCategory,
    deleteWorkCategory,
    updateAboutContent,
    addService,
    updateService,
    deleteService,
  } = useApp();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null);
  const [changingListingId, setChangingListingId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState("");
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const totalWhatsapp = listings.reduce((sum, listing) => sum + listing.whatsappClicks, 0);
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const mostViewed = useMemo(() => [...listings].sort((a, b) => b.views - a.views)[0], [listings]);
  const mostWhatsapp = useMemo(() => [...listings].sort((a, b) => b.whatsappClicks - a.whatsappClicks)[0], [listings]);
  const topWhatsappListings = useMemo(() => [...listings].sort((a, b) => b.whatsappClicks - a.whatsappClicks).slice(0, 4), [listings]);
  const whatsappPreviewListing = mostViewed ?? listings[0];
  const whatsappTemplate = lang === "ar" ? settings.whatsappMessageAr : settings.whatsappMessageEn;
  const whatsappPreview = whatsappPreviewListing
    ? (whatsappTemplate || "{title}")
        .replace(/\{title\}/g, whatsappPreviewListing.title[lang])
        .replace(/\{category\}/g, getSectorTitle(sectors, whatsappPreviewListing.category, lang))
        .replace(/\{id\}/g, String(whatsappPreviewListing.id))
    : "";

  const openEdit = (id: number) => {
    setEditingId(id);
    setDashboardView("edit");
  };

  const changeStatus = async (id: number, status: ListingStatus) => {
    setMutationError("");
    setChangingListingId(id);
    try {
      await updateListingStatus(id, status);
    } catch (error) {
      setMutationError(requestError(error, "تعذر تحديث حالة الإعلان."));
    } finally {
      setChangingListingId(null);
    }
  };

  const removeListing = async () => {
    if (!confirmDelete) return;
    setMutationError("");
    setChangingListingId(confirmDelete.id);
    try {
      await deleteListing(confirmDelete.id);
      setConfirmDelete(null);
    } catch (error) {
      setMutationError(requestError(error, "تعذر حذف الإعلان."));
    } finally {
      setChangingListingId(null);
    }
  };

  const nav: Array<{ id: DashboardView; label: string; icon: IconType }> = [
    { id: "overview", label: t.overview, icon: FiBarChart2 },
    { id: "listings", label: t.manageListings, icon: FiLayers },
    { id: "sectors", label: t.manageSectors, icon: FiGrid },
    { id: "create", label: t.createListing, icon: FiPlus },
    { id: "users", label: t.users, icon: FiUsers },
    { id: "settings", label: t.settings, icon: FiSettings },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6 lg:py-10">
      <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-slate-950 p-3 text-white shadow-2xl shadow-slate-950/20 lg:sticky lg:top-28">
        <div className="p-3">
          <span className="text-xs font-black uppercase text-amber-300">{t.dashboard}</span>
          <h1 className="mt-2 text-2xl font-black">{lang === "ar" ? "مركز الإدارة" : "Command center"}</h1>
        </div>
        <div className="mt-3 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = dashboardView === item.id || (dashboardView === "edit" && item.id === "listings");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDashboardView(item.id)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-black text-amber-300"><FiFolderPlus />{lang === "ar" ? "من نحن" : "About content"}</div>
            <div className="grid gap-1">{([
              ["about-profile", lang === "ar" ? "نبذة عن الشركة" : "Profile"],
              ["about-structure", lang === "ar" ? "الهيكل التنظيمي" : "Structure"],
              ["about-certificates", lang === "ar" ? "شهادات التقدير" : "Certificates"],
              ["about-work", lang === "ar" ? "سابقة الأعمال" : "Previous work"],
            ] as Array<[DashboardView,string]>).map(([id,label]) => <button key={id} type="button" onClick={() => setDashboardView(id)} className={`min-h-10 rounded-xl px-4 text-start text-xs font-black ${dashboardView === id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>{label}</button>)}</div>
          </div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-black text-amber-300"><FiFileText />{lang === "ar" ? "المحتوى الرئيسي" : "Main content"}</div>
            <div className="grid gap-1">{([
              ["arbitration-content", lang === "ar" ? "قطاعات التحكيم" : "Arbitration sectors"],
              ["valuation-content", lang === "ar" ? "التقييمات" : "Valuation"],
              ["consulting-content", lang === "ar" ? "الاستشارات" : "Consulting"],
            ] as Array<[DashboardView,string]>).map(([id,label]) => <button key={id} type="button" onClick={() => setDashboardView(id)} className={`min-h-10 rounded-xl px-4 text-start text-xs font-black ${dashboardView === id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>{label}</button>)}</div>
          </div>
        </div>
      </aside>

      <div className="grid gap-6">
        {adminListingsLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-800">
            <FiLoader className="animate-spin" />
            {lang === "ar" ? "جاري تحميل بيانات لوحة التحكم..." : "Loading dashboard data..."}
          </div>
        ) : null}
        {(adminListingsError || sectorsError || mutationError) ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{mutationError || adminListingsError || sectorsError}</span>
            {(adminListingsError || sectorsError) ? (
              <button type="button" onClick={() => void Promise.all([reloadAdminListings(), reloadContent()])} className="underline">
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <span className="text-xs font-black uppercase text-amber-700">{t.dashboard}</span>
              <h1 className="mt-1 text-3xl font-black text-slate-950">
                {lang === "ar" ? "إدارة مزادات الحبشي" : "El Habashy auction management"}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
                {lang === "ar"
                  ? "إدارة المحتوى، المزادات، واتجاهات واتساب واللوكيشن من مكان واحد."
                  : "Manage content, auctions, WhatsApp routing, and locations from one place."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setDashboardView("create")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white">
                <FiPlus />
                {t.createListing}
              </button>
              <button type="button" onClick={() => setDashboardView("settings")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:border-amber-300">
                <FiSettings />
                {t.settings}
              </button>
            </div>
          </div>
        </div>
        {dashboardView === "overview" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Stat icon={FiLayers} label={t.totalListings} value={listings.length} />
              <Stat icon={FiEye} label={t.activeListings} value={activeCount} />
              <Stat icon={FiBarChart2} label={t.totalViews} value={totalViews} />
              <Stat icon={FaWhatsapp} label={t.whatsappClicks} value={totalWhatsapp} />
              <Stat icon={FiBarChart2} label={t.mostViewedListing} value={mostViewed?.views ?? 0} hint={mostViewed?.title[lang]} />
              <Stat icon={FiFolderPlus} label={t.workCategories} value={aboutContent.workCategories.length} />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Panel title={t.mostViewedListing} icon={FiBarChart2}>
                {mostViewed ? (
                  <button type="button" onClick={() => selectListing(mostViewed.id)} className="grid w-full gap-4 rounded-3xl bg-slate-50 p-3 text-start">
                    <LazyImage src={mostViewed.images[0]} alt="" className="h-40 w-full rounded-2xl object-cover" />
                    <span>
                      <strong className="block text-2xl font-black text-slate-950">{mostViewed.title[lang]}</strong>
                      <small className="mt-3 block text-sm font-bold leading-6 text-slate-500">{mostViewed.summary[lang]}</small>
                    </span>
                  </button>
                ) : null}
              </Panel>
              <Panel title={t.mostContacted} icon={FaWhatsapp}>
                <div className="grid gap-3">
                  {topWhatsappListings.map((listing) => (
                    <button key={listing.id} type="button" onClick={() => selectListing(listing.id)} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-start">
                      <strong className="block text-sm font-black text-slate-950">{listing.title[lang]}</strong>
                      <span className="mt-1 block text-xs font-bold text-slate-500">{listing.whatsappClicks} {t.whatsappClicks}</span>
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel title={t.whatsappRouting} icon={FaWhatsapp} action={<Button onClick={() => setDashboardView("settings")} icon={FiSettings}>{t.settings}</Button>}>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-emerald-50 p-4">
                    <span className="text-xs font-black text-emerald-700">{t.defaultWhatsappNumber}</span>
                    <strong className="mt-2 block text-xl font-black text-slate-950">{settings.whatsappNumber}</strong>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <span className="text-xs font-black text-slate-500">{t.messagePreview}</span>
                    <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{whatsappPreview || t.emptyState}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SmallMetric label={t.whatsappClicks} value={totalWhatsapp} />
                    <SmallMetric label={t.mostContacted} value={mostWhatsapp?.whatsappClicks ?? 0} hint={mostWhatsapp?.title[lang]} />
                  </div>
                </div>
              </Panel>
            </div>
          </>
        ) : null}

        {dashboardView === "listings" ? (
          <Panel title={t.manageListings} icon={FiLayers} action={<Button onClick={() => setDashboardView("create")} icon={FiPlus}>{t.createListing}</Button>}>
            <div className="grid gap-3">
              {listings.map((listing) => (
                <div key={listing.id} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-lg hover:shadow-slate-950/5 lg:grid-cols-[96px_minmax(0,1fr)_auto] lg:items-center">
                  <LazyImage src={listing.images[0]} alt="" className="h-28 w-full rounded-2xl object-cover lg:h-24 lg:w-24" />
                  <div>
                    <strong className="line-clamp-1 text-lg font-black text-slate-950">{listing.title[lang]}</strong>
                    <div className="mt-2 flex flex-wrap gap-2">
                    <DataChip>{getSectorTitle(sectors, listing.category, lang)}</DataChip>
                    <DataChip>{listing.city[lang] || "-"}</DataChip>
                      <DataChip>{listing.whatsappClicks} {t.whatsappClicks}</DataChip>
                      {listing.expireDate ? <DataChip>{t.auctionExpireDate}: {listing.expireDate}</DataChip> : null}
                      <DataChip>{listing.views} {lang === "ar" ? "مشاهدة" : "views"}</DataChip>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <select
                      disabled={changingListingId === listing.id}
                      value={listing.status}
                      onChange={(event) => void changeStatus(listing.id, event.target.value as ListingStatus)}
                      className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-amber-400"
                    >
                      {(Object.keys(statusLabel) as ListingStatus[]).map((status) => (
                        <option key={status} value={status}>{statusLabel[status][lang]}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => openEdit(listing.id)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-amber-300">
                      {t.edit}
                    </button>
                    <button type="button" onClick={() => selectListing(listing.id)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-amber-300">
                      {t.viewDetails}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(listing)} className="grid h-11 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
              {!adminListingsLoading && !listings.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-black text-slate-500">
                  {lang === "ar" ? "لا توجد إعلانات حتى الآن." : "No listings yet."}
                </div>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {dashboardView === "sectors" ? (
          <SectorsPanel sectors={sectors} loading={sectorsLoading} onUpdate={updateSector} />
        ) : null}

        {dashboardView === "create" ? (
          <ListingForm
            title={t.createListing}
            submitLabel={t.saveListing}
            onSubmit={addListing}
            onFinished={() => setDashboardView("listings")}
          />
        ) : null}

        {dashboardView === "edit" ? (
          <ListingForm
            title={t.editListing}
            submitLabel={t.updateListing}
            listing={listings.find((listing) => listing.id === editingId)}
            initial={listingToDraft(listings.find((listing) => listing.id === editingId))}
            onSubmit={async (draft) => {
              if (!editingId) throw new Error("تعذر تحديد الإعلان المطلوب تعديله.");
              return updateListing(editingId, draft);
            }}
            onFinished={() => setDashboardView("listings")}
          />
        ) : null}

        {["about-profile", "about-structure", "about-certificates", "about-work", "about-content"].includes(dashboardView) ? (
          <AboutContentPanel
            view={dashboardView}
            content={aboutContent}
            onSaveContent={updateAboutContent}
            categories={aboutContent.workCategories}
            onAdd={addWorkCategory}
            onUpdate={updateWorkCategory}
            onDelete={deleteWorkCategory}
          />
        ) : null}

        {["arbitration-content", "valuation-content", "consulting-content", "services-content"].includes(dashboardView) ? (
          <ServicesContentPanel kind={dashboardView === "valuation-content" ? "valuation" : dashboardView === "consulting-content" ? "consulting" : "arbitration"} services={services} onAdd={addService} onUpdate={updateService} onDelete={deleteService} />
        ) : null}

        {dashboardView === "users" ? (
          <Panel title={t.users} icon={FiUsers}>
            <AdminUsers />
          </Panel>
        ) : null}

        {dashboardView === "settings" ? (
          <SettingsPanel settings={settings} onSubmit={updateSettings} />
        ) : null}
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-950">{t.confirmDelete}</h2>
            <p className="mt-3 text-sm font-semibold text-slate-500">{confirmDelete.title[lang]}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="h-12 rounded-full border border-slate-200 text-sm font-black text-slate-700">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={changingListingId === confirmDelete.id}
                onClick={() => void removeListing()}
                className="h-12 rounded-full bg-rose-600 text-sm font-black text-white"
              >
                {changingListingId === confirmDelete.id ? <FiLoader className="mx-auto animate-spin" /> : t.delete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SectorsPanel({
  sectors,
  loading,
  onUpdate,
}: {
  sectors: Sector[];
  loading: boolean;
  onUpdate: (id: ListingCategory, sector: Omit<Sector, "id">) => Promise<Sector>;
}) {
  const { lang, t } = useApp();

  return (
    <Panel title={t.manageSectors} icon={FiGrid}>
      {loading ? <div className="grid min-h-32 place-items-center"><FiLoader className="animate-spin text-2xl text-amber-600" /></div> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {sectors.map((sector) => (
          <SectorEditor key={sector.id} sector={sector} activeLabel={sector.title[lang]} onUpdate={onUpdate} />
        ))}
      </div>
      {!loading && !sectors.length ? <p className="py-8 text-center text-sm font-black text-slate-500">{lang === "ar" ? "لا توجد قطاعات." : "No sectors found."}</p> : null}
    </Panel>
  );
}

function SectorEditor({
  sector,
  activeLabel,
  onUpdate,
}: {
  sector: Sector;
  activeLabel: string;
  onUpdate: (id: ListingCategory, sector: Omit<Sector, "id">) => Promise<Sector>;
}) {
  const { t } = useApp();
  const Icon = categoryIcon[sector.id];
  const [draft, setDraft] = useState<Omit<Sector, "id">>({
    title: { ...sector.title },
    description: { ...sector.description },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft({ title: { ...sector.title }, description: { ...sector.description } });
  }, [sector]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await onUpdate(sector.id, draft);
      setDraft({ title: { ...updated.title }, description: { ...updated.description } });
    } catch (caught) {
      setError(requestError(caught, "تعذر حفظ القطاع."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-amber-300">
          <Icon />
        </span>
        <div>
          <h3 className="text-xl font-black text-slate-950">{activeLabel}</h3>
          <small className="font-bold text-slate-500">{sector.id}</small>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.sectorTitleAr} value={draft.title.ar} onChange={(value) => setDraft((current) => ({ ...current, title: { ...current.title, ar: value } }))} required />
        <Field label={t.sectorTitleEn} value={draft.title.en} onChange={(value) => setDraft((current) => ({ ...current, title: { ...current.title, en: value } }))} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea label={t.sectorDescriptionAr} value={draft.description.ar} onChange={(value) => setDraft((current) => ({ ...current, description: { ...current.description, ar: value } }))} />
        <Textarea label={t.sectorDescriptionEn} value={draft.description.en} onChange={(value) => setDraft((current) => ({ ...current, description: { ...current.description, en: value } }))} />
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 p-3 text-xs font-black text-rose-700">{error}</p> : null}
      <button disabled={saving} type="submit" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">
        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
        {t.saveSector}
      </button>
    </form>
  );
}

type PendingMediaStatus = "selected" | "ticket" | "uploading" | "completing" | "ready" | "failed";
type PendingMedia = {
  key: string;
  file: File;
  role: ListingMediaRole;
  status: PendingMediaStatus;
  progress: number;
  error?: string;
  media?: ListingMedia;
  mediaId?: number;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;

function mediaKey(file: File, role: ListingMediaRole) {
  return `${role}-${file.name}-${file.size}-${file.lastModified}`;
}

function mediaSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function validateMediaFile(file: File, role: ListingMediaRole) {
  const contentType = mediaContentType(file);
  if (role === "video") {
    if (!contentType.startsWith("video/")) return "صيغة الفيديو غير مدعومة.";
    if (file.size > MAX_VIDEO_BYTES) return "حجم الفيديو يجب ألا يتجاوز 5 GB.";
    return "";
  }
  if (!contentType.startsWith("image/")) return "صيغة الصورة غير مدعومة.";
  if (file.size > MAX_IMAGE_BYTES) return "حجم كل صورة يجب ألا يتجاوز 20 MB.";
  return "";
}

function ListingForm({
  title,
  submitLabel,
  initial = listingToDraft(),
  listing,
  onSubmit,
  onFinished,
}: {
  title: string;
  submitLabel: string;
  initial?: ListingDraft;
  listing?: Listing;
  onSubmit: (draft: ListingDraft) => Promise<Listing>;
  onFinished: () => void;
}) {
  const { lang, t, sectors, uploadListingMedia, deleteListingMedia } = useApp();
  const [draft, setDraft] = useState<ListingDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [savedListing, setSavedListing] = useState<Listing | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const mediaBusy = pendingMedia.some((item) => ["ticket", "uploading", "completing"].includes(item.status));

  const patchDraft = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const patchPending = (key: string, patch: Partial<PendingMedia>) => {
    setPendingMedia((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
  };

  const uploadOne = async (listingId: number, item: PendingMedia) => {
    patchPending(item.key, { status: "ticket", progress: 0, error: undefined });
    try {
      const media = await uploadListingMedia(listingId, item.file, item.role, {
        onStage(stage, ticketMedia) {
          patchPending(item.key, {
            status: stage,
            mediaId: ticketMedia?.id,
          });
        },
        onProgress(progress) {
          patchPending(item.key, { progress });
        },
      });
      patchPending(item.key, { status: "ready", progress: 100, media, mediaId: media.id });
      return true;
    } catch (caught) {
      patchPending(item.key, { status: "failed", error: requestError(caught, "تعذر رفع الملف.") });
      return false;
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mediaBusy || savedListing) return;
    setSaving(true);
    setError("");
    try {
      const persisted = await onSubmit(draft);
      setSavedListing(persisted);
      setSaving(false);
      const selected = pendingMedia.filter((item) => item.status === "selected");
      if (!selected.length) {
        onFinished();
        return;
      }
      for (const item of selected) await uploadOne(persisted.id, item);
    } catch (caught) {
      setError(requestError(caught, "تعذر حفظ الإعلان."));
    } finally {
      setSaving(false);
    }
  };

  const chooseMedia = (role: ListingMediaRole, files: FileList | null) => {
    const chosen = Array.from(files ?? []);
    if (!chosen.length) return;
    const relevant = role === "gallery" ? chosen : chosen.slice(0, 1);
    const invalid = relevant.map((file) => validateMediaFile(file, role)).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    const existing = (listing?.media ?? []).some((media) => media.role === role && media.status !== "failed");
    if (role !== "gallery" && existing) {
      setError(role === "thumbnail" ? "احذف صورة الغلاف الحالية قبل اختيار بديل." : "احذف الفيديو الحالي قبل اختيار بديل.");
      return;
    }
    const entries = relevant.map((file): PendingMedia => ({
      key: mediaKey(file, role),
      file,
      role,
      status: "selected",
      progress: 0,
    }));
    setError("");
    setPendingMedia((current) => role === "gallery"
      ? [...current.filter((item) => !entries.some((entry) => entry.key === item.key)), ...entries]
      : [...current.filter((item) => item.role !== role), ...entries]);
  };

  const retryMedia = async (item: PendingMedia) => {
    if (!savedListing || mediaBusy) return;
    if (item.mediaId) {
      setDeletingMediaId(item.mediaId);
      try {
        await deleteListingMedia(savedListing.id, item.mediaId);
      } catch {
        // A failed upload may already have been cleaned up; retry with a fresh ticket.
      } finally {
        setDeletingMediaId(null);
      }
    }
    await uploadOne(savedListing.id, { ...item, mediaId: undefined });
  };

  const removeExistingMedia = async (media: ListingMedia) => {
    const listingId = listing?.id ?? savedListing?.id;
    if (!listingId) return;
    setDeletingMediaId(media.id);
    setError("");
    try {
      await deleteListingMedia(listingId, media.id);
      if (media.role === "thumbnail") patchDraft("thumbnail", "");
      if (media.role === "gallery" && media.url) {
        setDraft((current) => ({ ...current, gallery: current.gallery.filter((url) => url !== media.url) }));
      }
    } catch (caught) {
      setError(requestError(caught, "تعذر حذف الملف."));
    } finally {
      setDeletingMediaId(null);
    }
  };

  const previewTitle = draft.titleAr || draft.titleEn || (lang === "ar" ? "مزاد جديد" : "New auction");
  const previewSummary =
    draft.summaryAr ||
    draft.summaryEn ||
    (lang === "ar" ? "ملخص المزاد يظهر هنا أثناء الكتابة." : "Auction summary appears here while typing.");
  const previewImage = draft.thumbnail || draft.gallery[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=84";
  const slugPreview = makeSlug(draft.seoSlug || draft.titleEn || draft.titleAr || "auction");
  const activeSeoTitle =
    lang === "ar"
      ? draft.seoTitleAr || draft.titleAr
      : draft.seoTitleEn || draft.titleEn || draft.titleAr;
  const activeSeoDescription =
    lang === "ar"
      ? draft.seoDescriptionAr || draft.summaryAr
      : draft.seoDescriptionEn || draft.summaryEn || draft.summaryAr;
  const readiness = [
    { label: t.titleAr, done: Boolean(draft.titleAr.trim()) },
    { label: t.category, done: Boolean(draft.category) },
    { label: t.summaryAr, done: Boolean(draft.summaryAr.trim()) },
    { label: t.thumbnail, done: Boolean(draft.thumbnail || pendingMedia.some((item) => item.role === "thumbnail")) },
    { label: t.auctionSessionDate, done: Boolean(draft.auctionDate || draft.expireDate) },
    { label: t.seoTitle, done: Boolean(draft.seoTitleAr || draft.seoTitleEn) },
    { label: t.seoDescription, done: Boolean(draft.seoDescriptionAr || draft.seoDescriptionEn) },
  ];
  const completedCount = readiness.filter((item) => item.done).length;

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/15">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="text-xs font-black uppercase text-amber-300">{title}</span>
            <h2 className="mt-2 text-3xl font-black">{lang === "ar" ? "نموذج نشر مزاد واضح ومنظم" : "Clear auction publishing workflow"}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-300">
              {lang === "ar" ? "املأ البيانات حسب الأقسام، وراجع المعاينة والـ SEO قبل الحفظ." : "Fill each section, then review the preview and SEO before saving."}
            </p>
          </div>
          <button disabled={saving || mediaBusy || Boolean(savedListing)} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {saving ? (lang === "ar" ? "جاري حفظ البيانات..." : "Saving metadata...") : savedListing ? (lang === "ar" ? "تم حفظ البيانات" : "Metadata saved") : submitLabel}
          </button>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <FormSection title={t.basicData} icon={FiEdit3}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.titleAr} value={draft.titleAr} onChange={(value) => patchDraft("titleAr", value)} required />
              <Field label={t.titleEn} value={draft.titleEn} onChange={(value) => patchDraft("titleEn", value)} />
              <Select label={t.category} value={draft.category} onChange={(value) => patchDraft("category", value as ListingCategory)}>
                {sectors.map((category) => (
                  <option key={category.id} value={category.id}>{category.title[lang]}</option>
                ))}
              </Select>
              <Select label={t.status} value={draft.status} onChange={(value) => patchDraft("status", value as ListingStatus)}>
                {(Object.keys(statusLabel) as ListingStatus[]).map((status) => (
                  <option key={status} value={status}>{statusLabel[status][lang]}</option>
                ))}
              </Select>
              <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 md:col-span-2">
                <input type="checkbox" checked={draft.featured} onChange={(event) => patchDraft("featured", event.target.checked)} />
                {t.featured}
              </label>
            </div>
          </FormSection>

          <FormSection title={t.locationValueData} icon={FiLayers}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.cityAr} value={draft.cityAr} onChange={(value) => patchDraft("cityAr", value)} />
              <Field label={t.cityEn} value={draft.cityEn} onChange={(value) => patchDraft("cityEn", value)} />
              <Field label={t.locationAr} value={draft.locationAr} onChange={(value) => patchDraft("locationAr", value)} />
              <Field label={t.locationEn} value={draft.locationEn} onChange={(value) => patchDraft("locationEn", value)} />
              <Field label={t.valueAr} value={draft.priceLabelAr} onChange={(value) => patchDraft("priceLabelAr", value)} />
              <Field label={t.valueEn} value={draft.priceLabelEn} onChange={(value) => patchDraft("priceLabelEn", value)} />
              <Field label={t.measure} value={draft.measureLabel} onChange={(value) => patchDraft("measureLabel", value)} />
            </div>
          </FormSection>

          <FormSection title={t.auctionData} icon={FiCalendar}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.auctionPublishDate} type="date" value={draft.publishDate} onChange={(value) => patchDraft("publishDate", value)} />
              <Field label={t.auctionExpireDate} type="date" value={draft.expireDate} onChange={(value) => patchDraft("expireDate", value)} />
              <Field label={t.auctionSessionDate} type="date" value={draft.auctionDate} onChange={(value) => patchDraft("auctionDate", value)} />
              <Field label={t.auctionSessionTime} type="time" value={draft.auctionTime} onChange={(value) => patchDraft("auctionTime", value)} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={`${t.beneficiary} AR`} value={draft.beneficiaryAr} onChange={(value) => patchDraft("beneficiaryAr", value)} />
              <Field label={`${t.beneficiary} EN`} value={draft.beneficiaryEn} onChange={(value) => patchDraft("beneficiaryEn", value)} />
              <Field label={`${t.venue} AR`} value={draft.venueAr} onChange={(value) => patchDraft("venueAr", value)} />
              <Field label={`${t.venue} EN`} value={draft.venueEn} onChange={(value) => patchDraft("venueEn", value)} />
              <Field label={`${t.announcementSource} AR`} value={draft.announcementSourceAr} onChange={(value) => patchDraft("announcementSourceAr", value)} />
              <Field label={`${t.announcementSource} EN`} value={draft.announcementSourceEn} onChange={(value) => patchDraft("announcementSourceEn", value)} />
              <Field label={t.mapUrl} value={draft.mapUrl} onChange={(value) => patchDraft("mapUrl", value)} />
              <Field label={`${t.listingWhatsappOverride} (${t.optionalOverride})`} value={draft.whatsappPhone} onChange={(value) => patchDraft("whatsappPhone", value)} />
            </div>
          </FormSection>

          <FormSection title={t.contentData} icon={FiFileText}>
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea label={t.summaryAr} value={draft.summaryAr} onChange={(value) => patchDraft("summaryAr", value)} />
              <Textarea label={t.summaryEn} value={draft.summaryEn} onChange={(value) => patchDraft("summaryEn", value)} />
            </div>
            <div className="mt-5 grid gap-5">
              <RichTextEditor label={t.descriptionAr} value={draft.descriptionAr} onChange={(value) => patchDraft("descriptionAr", value)} placeholder={t.descriptionAr} />
              <RichTextEditor label={t.descriptionEn} value={draft.descriptionEn} onChange={(value) => patchDraft("descriptionEn", value)} placeholder={t.descriptionEn} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Textarea label={`${t.auctionNotes} AR`} value={draft.notesAr} onChange={(value) => patchDraft("notesAr", value)} />
              <Textarea label={`${t.auctionNotes} EN`} value={draft.notesEn} onChange={(value) => patchDraft("notesEn", value)} />
            </div>
          </FormSection>

          <FormSection title={t.mediaData} icon={FiUploadCloud}>
            <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold leading-7 text-sky-900">
              {lang === "ar"
                ? "سيتم حفظ بيانات الإعلان أولًا، ثم رفع كل ملف مباشرة إلى Cloudinary. إنشاء الإعلان لا يتم إلغاؤه إذا فشل ملف، ويمكنك إعادة محاولة الملف وحده."
                : "Listing metadata is saved first, then each file uploads directly to Cloudinary. A failed file does not roll back the listing and can be retried separately."}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FileInput disabled={Boolean(savedListing)} accept="image/jpeg,image/png,image/webp,image/gif" label={t.thumbnail} button={t.chooseImage} onChange={(event) => { chooseMedia("thumbnail", event.target.files); event.target.value = ""; }} />
              <FileInput disabled={Boolean(savedListing)} accept="image/jpeg,image/png,image/webp,image/gif" label={t.galleryImages} button={t.chooseImages} onChange={(event) => { chooseMedia("gallery", event.target.files); event.target.value = ""; }} multiple />
              <FileInput disabled={Boolean(savedListing)} accept="video/mp4,video/webm,video/quicktime,video/x-matroska" label={lang === "ar" ? "فيديو الإعلان" : "Listing video"} button={lang === "ar" ? "اختيار فيديو" : "Choose video"} onChange={(event) => { chooseMedia("video", event.target.files); event.target.value = ""; }} />
            </div>

            {(listing?.media?.length ?? 0) > 0 ? (
              <div className="mt-5 grid gap-3">
                <strong className="text-sm font-black text-slate-800">{lang === "ar" ? "الملفات الحالية على الخادم" : "Current server media"}</strong>
                {listing?.media?.map((media) => (
                  <div key={media.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm font-black text-slate-900">{media.fileName}</strong><MediaBadge value={media.role} /><MediaBadge value={media.status} /></div>
                      <small className="mt-1 block font-bold text-slate-500">{media.contentType}{media.bytes ? ` · ${mediaSize(media.bytes)}` : ""}{media.failureReason ? ` · ${media.failureReason}` : ""}</small>
                    </div>
                    <button disabled={deletingMediaId === media.id || mediaBusy} type="button" onClick={() => void removeExistingMedia(media)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 text-xs font-black text-rose-700 disabled:opacity-50">
                      {deletingMediaId === media.id ? <FiLoader className="animate-spin" /> : <FiTrash2 />}{lang === "ar" ? "حذف الملف" : "Delete media"}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {pendingMedia.length ? (
              <div className="mt-5 grid gap-3">
                <strong className="text-sm font-black text-slate-800">{lang === "ar" ? "الملفات المختارة وحالة الرفع" : "Selected files and upload status"}</strong>
                {pendingMedia.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm font-black text-slate-900">{item.file.name}</strong><MediaBadge value={item.role} /><MediaBadge value={item.status} /></div><small className="mt-1 block font-bold text-slate-500">{mediaContentType(item.file)} · {mediaSize(item.file.size)}</small></div>
                      <div className="flex gap-2">
                        {item.status === "failed" && savedListing ? <button disabled={mediaBusy || deletingMediaId === item.mediaId} type="button" onClick={() => void retryMedia(item)} className="h-10 rounded-xl bg-amber-100 px-4 text-xs font-black text-amber-900">{lang === "ar" ? "إعادة المحاولة" : "Retry"}</button> : null}
                        {item.status === "selected" && !savedListing ? <button type="button" onClick={() => setPendingMedia((current) => current.filter((entry) => entry.key !== item.key))} className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-black text-slate-700">{lang === "ar" ? "إزالة" : "Remove"}</button> : null}
                      </div>
                    </div>
                    {item.status !== "selected" ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${item.status === "failed" ? "bg-rose-500" : item.status === "ready" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${item.status === "failed" ? Math.max(4, item.progress) : item.progress}%` }} /></div> : null}
                    {item.error ? <p className="mt-2 text-xs font-black text-rose-700">{item.error}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {savedListing ? (
              <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center">
                <div><strong className="block text-sm font-black text-emerald-900">{lang === "ar" ? `تم حفظ الإعلان رقم ${savedListing.id}` : `Listing #${savedListing.id} is saved`}</strong><small className="mt-1 block font-bold text-emerald-700">{lang === "ar" ? "راجع نتائج الملفات بالأعلى؛ يمكنك إنهاء الخطوة حتى لو فشل أحدها." : "Review file results above; you can finish even if an individual upload failed."}</small></div>
                <button disabled={mediaBusy} type="button" onClick={onFinished} className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{lang === "ar" ? "إنهاء والعودة للإعلانات" : "Finish and return"}</button>
              </div>
            ) : null}
          </FormSection>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">{error}</div> : null}

          <FormSection title="SEO" icon={FiSearch}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={`${t.seoTitle} AR`} value={draft.seoTitleAr} onChange={(value) => patchDraft("seoTitleAr", value)} />
              <Field label={`${t.seoTitle} EN`} value={draft.seoTitleEn} onChange={(value) => patchDraft("seoTitleEn", value)} />
              <Textarea label={`${t.seoDescription} AR`} value={draft.seoDescriptionAr} onChange={(value) => patchDraft("seoDescriptionAr", value)} />
              <Textarea label={`${t.seoDescription} EN`} value={draft.seoDescriptionEn} onChange={(value) => patchDraft("seoDescriptionEn", value)} />
              <Field label={`${t.seoKeywords} AR`} value={draft.seoKeywordsAr} onChange={(value) => patchDraft("seoKeywordsAr", value)} />
              <Field label={`${t.seoKeywords} EN`} value={draft.seoKeywordsEn} onChange={(value) => patchDraft("seoKeywordsEn", value)} />
              <Field label={t.seoSlug} value={draft.seoSlug} onChange={(value) => patchDraft("seoSlug", value)} />
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-black text-slate-500">{t.seoPreview}</span>
              <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-emerald-700">{t.searchResultUrl}{slugPreview}</p>
                <h3 className="mt-1 line-clamp-1 text-xl font-black text-blue-700">{activeSeoTitle || previewTitle}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{activeSeoDescription || previewSummary}</p>
              </div>
            </div>
          </FormSection>
        </div>

        <aside className="grid h-fit gap-4 2xl:sticky 2xl:top-28">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
            <LazyImage src={previewImage} alt="" className="aspect-[1.45] w-full object-cover" />
            <div className="p-5">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                {getSectorTitle(sectors, draft.category, lang)}
              </span>
              <h3 className="mt-4 line-clamp-2 text-2xl font-black leading-tight text-slate-950">{previewTitle}</h3>
              <p className="mt-3 line-clamp-3 text-sm font-semibold leading-7 text-slate-500">{previewSummary}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black text-slate-500">
                <SmallMetric label={t.status} value={statusLabel[draft.status][lang]} />
                <SmallMetric label={t.auctionExpireDate} value={draft.expireDate || "-"} />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-950">{t.publishReadiness}</h3>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-amber-300">{completedCount}/{readiness.length}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {readiness.map((item) => (
                <span key={item.label} className={`flex items-center gap-2 rounded-2xl p-3 text-sm font-black ${item.done ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {item.done ? <FiCheckCircle /> : <FiAlertCircle />}
                  {item.label}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}

type WorkCategoryDraft = {
  titleAr: string;
  titleEn: string;
  itemsAr: string;
  itemsEn: string;
};

const emptyWorkCategoryDraft: WorkCategoryDraft = {
  titleAr: "",
  titleEn: "",
  itemsAr: "",
  itemsEn: "",
};

function categoryToDraft(category: WorkCategory): WorkCategoryDraft {
  return {
    titleAr: category.title.ar,
    titleEn: category.title.en,
    itemsAr: category.items.map((item) => item.ar).join("\n"),
    itemsEn: category.items.map((item) => item.en).join("\n"),
  };
}

function draftToCategory(draft: WorkCategoryDraft): Omit<WorkCategory, "id"> {
  const arItems = draft.itemsAr.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const enItems = draft.itemsEn.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const max = Math.max(arItems.length, enItems.length);
  return {
    title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr },
    items: Array.from({ length: max }, (_, index) => ({
      ar: arItems[index] || enItems[index] || "",
      en: enItems[index] || arItems[index] || "",
    })).filter((item) => item.ar || item.en),
  };
}

type CertificateDraft = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  date: string;
};

const emptyCertificateDraft: CertificateDraft = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  date: "",
};

function certificateToDraft(certificate: Certificate): CertificateDraft {
  return {
    titleAr: certificate.title.ar,
    titleEn: certificate.title.en,
    descriptionAr: certificate.description.ar,
    descriptionEn: certificate.description.en,
    date: certificate.date,
  };
}

function draftToCertificate(draft: CertificateDraft): Omit<Certificate, "id"> {
  return {
    title: {
      ar: draft.titleAr,
      en: draft.titleEn || draft.titleAr,
    },
    description: {
      ar: draft.descriptionAr,
      en: draft.descriptionEn || draft.descriptionAr,
    },
    date: draft.date,
  };
}

type StructureDraft = {
  leadersAr: string;
  leadersEn: string;
  departmentsAr: string;
  departmentsEn: string;
};

function splitLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function structureToDraft(structure: AboutContent["structure"]): StructureDraft {
  return {
    leadersAr: structure.leaders.map((item) => item.ar).join("\n"),
    leadersEn: structure.leaders.map((item) => item.en).join("\n"),
    departmentsAr: structure.departments.map((item) => item.ar).join("\n"),
    departmentsEn: structure.departments.map((item) => item.en).join("\n"),
  };
}

function draftToLocalizedList(ar: string, en: string) {
  const arItems = splitLines(ar);
  const enItems = splitLines(en);
  const max = Math.max(arItems.length, enItems.length);
  return Array.from({ length: max }, (_, index) => ({
    ar: arItems[index] || enItems[index] || "",
    en: enItems[index] || arItems[index] || "",
  })).filter((item) => item.ar || item.en);
}

function draftToStructure(draft: StructureDraft): AboutContent["structure"] {
  return {
    leaders: draftToLocalizedList(draft.leadersAr, draft.leadersEn),
    departments: draftToLocalizedList(draft.departmentsAr, draft.departmentsEn),
  };
}

function AboutContentPanel({
  view,
  content,
  onSaveContent,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  view: DashboardView;
  content: AboutContent;
  onSaveContent: (content: AboutContent) => void;
  categories: WorkCategory[];
  onAdd: (category: Omit<WorkCategory, "id">) => void;
  onUpdate: (id: number, category: Omit<WorkCategory, "id">) => void;
  onDelete: (id: number) => void;
}) {
  const { lang, t } = useApp();
  const [draft, setDraft] = useState<WorkCategoryDraft>(emptyWorkCategoryDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mainContent, setMainContent] = useState<AboutContent>(content);
  const [certificateDraft, setCertificateDraft] = useState<CertificateDraft>(emptyCertificateDraft);
  const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
  const [structureDraft, setStructureDraft] = useState<StructureDraft>(() => structureToDraft(content.structure));
  const showProfile = view === "about-profile" || view === "about-content";
  const showStructure = view === "about-structure" || view === "about-content";
  const showCertificates = view === "about-certificates" || view === "about-content";
  const showWork = view === "about-work" || view === "about-content";

  const saveMainContent = (nextContent: AboutContent) => {
    setMainContent(nextContent);
    onSaveContent(nextContent);
  };

  const patch = <K extends keyof WorkCategoryDraft>(key: K, value: WorkCategoryDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const editCategory = (category: WorkCategory) => {
    setEditingId(category.id);
    setDraft(categoryToDraft(category));
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyWorkCategoryDraft);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = draftToCategory(draft);
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd(payload);
    }
    reset();
  };

  const patchCertificate = <K extends keyof CertificateDraft>(key: K, value: CertificateDraft[K]) => {
    setCertificateDraft((current) => ({ ...current, [key]: value }));
  };

  const editCertificate = (certificate: Certificate) => {
    setEditingCertificateId(certificate.id);
    setCertificateDraft(certificateToDraft(certificate));
  };

  const resetCertificate = () => {
    setEditingCertificateId(null);
    setCertificateDraft(emptyCertificateDraft);
  };

  const submitCertificate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = draftToCertificate(certificateDraft);
    const nextCertificates = editingCertificateId
      ? mainContent.certificates.map((item) => (item.id === editingCertificateId ? { id: editingCertificateId, ...payload } : item))
      : [{ id: Math.max(0, ...mainContent.certificates.map((item) => item.id)) + 1, ...payload }, ...mainContent.certificates];
    saveMainContent({ ...mainContent, certificates: nextCertificates });
    resetCertificate();
  };

  const deleteCertificate = (id: number) => {
    saveMainContent({ ...mainContent, certificates: mainContent.certificates.filter((item) => item.id !== id) });
  };

  const submitStructure = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMainContent({ ...mainContent, structure: draftToStructure(structureDraft) });
  };

  return (
    <div className="grid gap-6">
      {showProfile ? (
        <Panel title={t.aboutProfile} icon={FiEdit3} action={<Button icon={FiSave} onClick={() => saveMainContent(mainContent)}>{lang === "ar" ? "حفظ" : "Save"}</Button>}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Textarea label={`${t.aboutProfile} AR`} value={mainContent.profile.ar} onChange={(value) => setMainContent((current) => ({ ...current, profile: { ...current.profile, ar: value } }))} />
            <Textarea label={`${t.aboutProfile} EN`} value={mainContent.profile.en} onChange={(value) => setMainContent((current) => ({ ...current, profile: { ...current.profile, en: value } }))} />
          </div>
        </Panel>
      ) : null}

      {showStructure ? (
        <Panel title={t.organizationStructure} icon={FiUsers}>
          <form onSubmit={submitStructure} className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <Textarea label={t.leadersAr} value={structureDraft.leadersAr} onChange={(value) => setStructureDraft((current) => ({ ...current, leadersAr: value }))} />
              <Textarea label={t.leadersEn} value={structureDraft.leadersEn} onChange={(value) => setStructureDraft((current) => ({ ...current, leadersEn: value }))} />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Textarea label={t.departmentsAr} value={structureDraft.departmentsAr} onChange={(value) => setStructureDraft((current) => ({ ...current, departmentsAr: value }))} />
              <Textarea label={t.departmentsEn} value={structureDraft.departmentsEn} onChange={(value) => setStructureDraft((current) => ({ ...current, departmentsEn: value }))} />
            </div>
            <button type="submit" className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white">
              <FiSave />
              {t.saveStructure}
            </button>
          </form>
        </Panel>
      ) : null}

      {showCertificates ? (
        <Panel title={t.honorCertificates} icon={FiFileText}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid content-start gap-3">
              {mainContent.certificates.length ? (
                mainContent.certificates.map((certificate) => (
                  <article key={certificate.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div>
                      <strong className="block text-lg font-black text-slate-950">{certificate.title[lang]}</strong>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-slate-500">
                        <span>{certificate.date || "-"}</span>
                        <span>{certificate.title.ar}</span>
                        <span>{certificate.title.en}</span>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button type="button" onClick={() => editCertificate(certificate)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-amber-300">
                        {t.edit}
                      </button>
                      <button type="button" onClick={() => deleteCertificate(certificate.id)} className="grid h-11 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-black text-slate-500">
                  {t.emptyState}
                </div>
              )}
            </div>

            <form onSubmit={submitCertificate} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-slate-950">{editingCertificateId ? t.editCertificate : t.addCertificate}</h3>
                {editingCertificateId ? (
                  <button type="button" onClick={resetCertificate} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600">
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                ) : null}
              </div>
              <Field label={t.certificateTitleAr} value={certificateDraft.titleAr} onChange={(value) => patchCertificate("titleAr", value)} required />
              <Field label={t.certificateTitleEn} value={certificateDraft.titleEn} onChange={(value) => patchCertificate("titleEn", value)} />
              <Field label={t.certificateDate} value={certificateDraft.date} onChange={(value) => patchCertificate("date", value)} />
              <Textarea label={t.certificateDescriptionAr} value={certificateDraft.descriptionAr} onChange={(value) => patchCertificate("descriptionAr", value)} />
              <Textarea label={t.certificateDescriptionEn} value={certificateDraft.descriptionEn} onChange={(value) => patchCertificate("descriptionEn", value)} />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15">
                <FiSave />
                {t.saveCertificate}
              </button>
            </form>
          </div>
        </Panel>
      ) : null}

      {showWork ? <Panel title={t.aboutContent} icon={FiFolderPlus}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-3">
            {categories.length ? (
              categories.map((category) => (
                <article key={category.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <strong className="block text-lg font-black text-slate-950">{category.title[lang]}</strong>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-slate-500">
                      <span>{category.items.length} {t.itemCount}</span>
                      <span>{category.title.ar}</span>
                      <span>{category.title.en}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => editCategory(category)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-amber-300">
                      {t.edit}
                    </button>
                    <button type="button" onClick={() => onDelete(category.id)} className="grid h-11 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                      <FiTrash2 />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-black text-slate-500">
                {t.emptyState}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="h-fit rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-950">{editingId ? t.editWorkCategory : t.addWorkCategory}</h3>
              {editingId ? (
                <button type="button" onClick={reset} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              ) : null}
            </div>
            <div className="grid gap-4">
              <Field label={t.categoryTitleAr} value={draft.titleAr} onChange={(value) => patch("titleAr", value)} required />
              <Field label={t.categoryTitleEn} value={draft.titleEn} onChange={(value) => patch("titleEn", value)} />
              <Textarea label={t.categoryItemsAr} value={draft.itemsAr} onChange={(value) => patch("itemsAr", value)} />
              <Textarea label={t.categoryItemsEn} value={draft.itemsEn} onChange={(value) => patch("itemsEn", value)} />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15">
                <FiSave />
                {t.saveCategory}
              </button>
            </div>
          </form>
        </div>
      </Panel> : null}
    </div>
  );
}

const emptyServiceDraft: ServiceDraft = { kind: "arbitration", titleAr: "", titleEn: "", summaryAr: "", summaryEn: "", contentAr: "", contentEn: "", image: "", gallery: [], featured: true };

function ServicesContentPanel({ kind, services, onAdd, onUpdate, onDelete }: { kind: ServiceKind; services: ServiceArticle[]; onAdd: (draft: ServiceDraft) => void; onUpdate: (id: number, draft: ServiceDraft) => void; onDelete: (id: number) => void }) {
  const { lang } = useApp();
  const [draft, setDraft] = useState<ServiceDraft>({ ...emptyServiceDraft, kind });
  const [editing, setEditing] = useState<number | null>(null);
  const patch = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const edit = (item: ServiceArticle) => { setEditing(item.id); setDraft({ kind: item.kind, titleAr: item.title.ar, titleEn: item.title.en, summaryAr: item.summary.ar, summaryEn: item.summary.en, contentAr: item.content.ar, contentEn: item.content.en, image: item.image, gallery: item.gallery || [], featured: item.featured }); };
  const submit = (event: FormEvent) => { event.preventDefault(); editing ? onUpdate(editing, draft) : onAdd({ ...draft, kind }); setEditing(null); setDraft({ ...emptyServiceDraft, kind }); };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => { const [image] = await readImages(event.target.files); if (image) patch("image", image); };
  const uploadGallery = async (event: ChangeEvent<HTMLInputElement>) => { const images = await readImages(event.target.files); if (images.length) patch("gallery", [...draft.gallery, ...images]); };
  return <div className="grid gap-6">
    <Panel title={lang === "ar" ? "إدارة الخدمات وقطاعات التحكيم" : "Manage services & arbitration"} icon={FiFileText}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid content-start gap-3">{services.filter((item) => item.kind === kind).map((item) => <article key={item.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center"><LazyImage src={item.image} alt="" className="h-20 w-full rounded-2xl object-cover sm:w-20"/><div><strong className="block text-lg font-black">{item.title[lang]}</strong><small className="mt-1 block font-bold text-slate-500">{item.kind}</small></div><div className="flex gap-2"><button onClick={() => edit(item)} className="h-10 rounded-xl border px-4 text-sm font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button onClick={() => onDelete(item.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div></article>)}</div>
        <form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between"><h3 className="text-xl font-black">{editing ? (lang === "ar" ? "تعديل المقال" : "Edit article") : (lang === "ar" ? "إضافة مقال" : "Add article")}</h3>{editing && <button type="button" onClick={() => { setEditing(null); setDraft({ ...emptyServiceDraft, kind }); }} className="text-sm font-black text-slate-500">{lang === "ar" ? "إلغاء" : "Cancel"}</button>}</div>
          <Select label={lang === "ar" ? "القسم" : "Section"} value={draft.kind} onChange={(value) => patch("kind", value as ServiceKind)}><option value="arbitration">{lang === "ar" ? "قطاعات التحكيم" : "Arbitration"}</option><option value="valuation">{lang === "ar" ? "التقييمات ودراسات الجدوى" : "Valuation"}</option><option value="consulting">{lang === "ar" ? "الاستشارات" : "Consulting"}</option></Select>
          <Field label="العنوان بالعربية" value={draft.titleAr} onChange={(v) => patch("titleAr", v)} required/><Field label="Title in English" value={draft.titleEn} onChange={(v) => patch("titleEn", v)}/>
          <Textarea label="ملخص بالعربية" value={draft.summaryAr} onChange={(v) => patch("summaryAr", v)}/><Textarea label="English summary" value={draft.summaryEn} onChange={(v) => patch("summaryEn", v)}/>
          <FileInput label={lang === "ar" ? "صورة المقال" : "Article image"} button={lang === "ar" ? "اختيار صورة" : "Choose image"} onChange={upload}/>{draft.image && <LazyImage src={draft.image} alt="" className="h-36 w-full rounded-2xl object-cover"/>}
          <FileInput label={lang === "ar" ? "مجموعة صور إضافية" : "Additional gallery"} button={lang === "ar" ? "رفع مجموعة صور" : "Upload images"} multiple onChange={uploadGallery}/>{draft.gallery.length ? <div className="grid grid-cols-3 gap-2">{draft.gallery.map((image, index) => <LazyImage key={index} src={image} alt="" className="h-20 w-full rounded-xl object-cover" />)}</div> : null}
          <RichTextEditor label="محتوى المقال بالعربية" value={draft.contentAr} onChange={(v) => patch("contentAr", v)} placeholder="اكتب المحتوى ونسقه مثل Word"/><RichTextEditor label="Article content in English" value={draft.contentEn} onChange={(v) => patch("contentEn", v)} placeholder="Write and format the article"/>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white"><FiSave />{lang === "ar" ? "حفظ ونشر" : "Save & publish"}</button>
        </form>
      </div>
    </Panel>
  </div>;
}

function SettingsPanel({ settings, onSubmit }: { settings: AppSettings; onSubmit: (settings: AppSettings) => void }) {
  const { lang, t, sectors } = useApp();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const previewAuctionTitle = lang === "ar" ? "مزاد عقاري" : "Property auction";
  const activeTemplate = lang === "ar" ? draft.whatsappMessageAr : draft.whatsappMessageEn;
  const preview = (activeTemplate || "{title}")
    .replace(/\{title\}/g, previewAuctionTitle)
    .replace(/\{category\}/g, getSectorTitle(sectors, "real-estate", lang))
    .replace(/\{id\}/g, "1");

  const patch = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(draft);
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Panel title={t.communicationSettings} icon={FiSettings} action={<Button type="submit" icon={FiSave}>{t.saveSettings}</Button>}>
        <div className="grid gap-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <Field label={t.defaultWhatsappNumber} value={draft.whatsappNumber} onChange={(value) => patch("whatsappNumber", value)} required />
              <Field label={t.contactPhone} value={draft.contactPhone} onChange={(value) => patch("contactPhone", value)} />
              <Field label={t.contactEmail} value={draft.contactEmail} onChange={(value) => patch("contactEmail", value)} />
              <Field label={`${t.officeAddress} AR`} value={draft.officeAddress.ar} onChange={(value) => patch("officeAddress", { ...draft.officeAddress, ar: value })} />
              <Field label={`${t.officeAddress} EN`} value={draft.officeAddress.en} onChange={(value) => patch("officeAddress", { ...draft.officeAddress, en: value })} />
              <Field label={t.mapUrl} value={draft.mapUrl} onChange={(value) => patch("mapUrl", value)} />
              <Field label="Facebook" value={draft.facebookUrl} onChange={(value) => patch("facebookUrl", value)} />
              <Field label="LinkedIn" value={draft.linkedinUrl} onChange={(value) => patch("linkedinUrl", value)} />
            </div>

            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white">
                <FaWhatsapp />
              </span>
              <h3 className="mt-5 text-2xl font-black">{t.whatsappRouting}</h3>
              <p className="mt-3 text-sm font-bold leading-7 text-slate-300">{preview}</p>
              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <span className="text-xs font-black text-emerald-200">{t.defaultWhatsappNumber}</span>
                <strong className="mt-1 block text-lg font-black">{draft.whatsappNumber || t.emptyState}</strong>
              </div>
              {draft.mapUrl ? (
                <a href={draft.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white hover:text-slate-950">
                  <FiMapPin />
                  {t.openLocation}
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Textarea label={t.whatsappMessageAr} value={draft.whatsappMessageAr} onChange={(value) => patch("whatsappMessageAr", value)} />
            <Textarea label={t.whatsappMessageEn} value={draft.whatsappMessageEn} onChange={(value) => patch("whatsappMessageEn", value)} />
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900">
            {lang === "ar"
              ? "تقدر تستخدم {title} لاسم المزاد، {category} للتصنيف، و {id} لرقم المزاد داخل رسالة الواتساب."
              : "You can use {title} for the auction name, {category} for category, and {id} for the auction id inside the WhatsApp message."}
          </div>
        </div>
      </Panel>
    </form>
  );
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: IconType; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-amber-300">
          <Icon />
        </span>
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Panel({ title, icon: Icon, children, action }: { title: string; icon: IconType; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="animate-fade-up rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-amber-300">
            <Icon />
          </span>
          <h2 className="text-xl font-black text-slate-950 md:text-2xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SmallMetric({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <span className="rounded-2xl bg-slate-50 p-3">
      <strong className="block text-xl font-black text-slate-950">{typeof value === "number" ? value.toLocaleString() : value}</strong>
      <small className="mt-1 block text-xs font-black text-slate-500">{label}</small>
      {hint ? <small className="mt-1 block truncate text-[11px] font-bold text-amber-700">{hint}</small> : null}
    </span>
  );
}

function MediaBadge({ value }: { value: string }) {
  const tone = value === "ready"
    ? "bg-emerald-100 text-emerald-800"
    : value === "failed"
      ? "bg-rose-100 text-rose-800"
      : value === "uploading" || value === "completing" || value === "ticket" || value === "processing"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tone}`}>{value}</span>;
}

function DataChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
      {children}
    </span>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: IconType; label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-950/5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-black leading-5 text-slate-500">{label}</span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-amber-300">
          <Icon />
        </span>
      </div>
      <strong className="mt-4 block text-3xl font-black text-slate-950">{value.toLocaleString()}</strong>
      {hint ? <small className="mt-2 block truncate text-xs font-bold text-amber-700">{hint}</small> : null}
    </div>
  );
}

function Button({ children, icon: Icon, onClick, type = "button" }: { children: ReactNode; icon: IconType; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800">
      <Icon />
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black text-slate-700">
      {label}
      <input
        type={type}
        dir={type === "date" || type === "time" ? "ltr" : undefined}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-start text-sm outline-none focus:border-amber-400 focus:bg-white"
      />
    </label>
  );
}

function AdminUsers() {
  const { authorizedRequest } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError("");
    authorizedRequest<PageResponse<AuthUser>>("/api/v1/admin/users?page=0&size=20")
      .then((page) => setUsers(page.content))
      .catch((caught) => setError(caught instanceof ApiError ? caught.message : "تعذر تحميل المستخدمين."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [authorizedRequest]);

  const patch = async (user: AuthUser, kind: "role" | "status", value: UserRole | boolean) => {
    setChanging(user.id); setError("");
    try {
      await authorizedRequest(`/api/v1/admin/users/${user.id}/${kind}`, { method: "PATCH", body: kind === "role" ? { role: value } : { enabled: value } });
      setUsers((all) => all.map((item) => item.id === user.id ? { ...item, [kind === "role" ? "role" : "enabled"]: value } : item));
    } catch (caught) { setError(caught instanceof ApiError ? caught.message : "تعذر حفظ التغيير."); }
    finally { setChanging(null); }
  };

  if (loading) return <div className="grid min-h-40 place-items-center"><FiLoader className="animate-spin text-2xl text-amber-600" /></div>;
  return <div className="grid gap-3">{error && <div className="flex items-center justify-between rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700"><span>{error}</span><button onClick={load} className="font-black underline">إعادة المحاولة</button></div>}<div className="grid gap-3 md:grid-cols-2">{users.map((user) => <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span><strong className="block text-lg font-black text-slate-950">{user.firstName} {user.lastName}</strong><small className="mt-1 block font-bold text-slate-500">{user.email}</small></span><span className={`h-3 w-3 rounded-full ${user.enabled ? "bg-emerald-500" : "bg-rose-500"}`} /></div><div className="mt-5 grid grid-cols-2 gap-2"><select disabled={changing === user.id} value={user.role} onChange={(e) => patch(user, "role", e.target.value as UserRole)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-black"><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select><button disabled={changing === user.id} onClick={() => patch(user, "status", !user.enabled)} className={`rounded-xl text-xs font-black ${user.enabled ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{user.enabled ? "تعطيل" : "تفعيل"}</button></div></div>)}</div>{!users.length && !error && <p className="py-10 text-center text-sm font-bold text-slate-400">لا يوجد مستخدمون.</p>}</div>;
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white"
      />
    </label>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-black text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-amber-400 focus:bg-white">
        {children}
      </select>
    </label>
  );
}

function FileInput({ label, button, multiple, accept = "image/*", disabled, onChange }: { label: string; button: string; multiple?: boolean; accept?: string; disabled?: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className={`grid gap-2 text-sm font-black text-slate-700 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      {label}
      <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-600 transition hover:border-amber-400 hover:bg-amber-50">
        <FiUploadCloud />
        {button}
      </span>
      <input disabled={disabled} type="file" accept={accept} multiple={multiple} onChange={onChange} className="sr-only" />
    </label>
  );
}
