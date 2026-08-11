import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
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
import type { AboutContent, AboutDepartment, AboutPerson, AboutProfile, AppSettings, Certificate, DashboardView, Listing, ListingCategory, ListingDraft, ListingMedia, ListingMediaRole, ListingStatus, Sector, WorkCategory, WorkEntry, ServiceArticle, ServiceDraft, ServiceKind } from "../types";
import { useAuth } from "../context/AuthContext";
import type { AuthUser, ListingSubmissionMedia, PageResponse, UserRole } from "../lib/elHabashyApi";
import { ApiError } from "../lib/api";
import { mediaContentType, MediaProcessingFailedError } from "../lib/listingMediaApi";

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

type PendingMediaStatus = "selected" | "sending" | "uploading" | "processing" | "ready" | "failed" | "error";
type PendingMedia = {
  key: string;
  file: File;
  role: ListingMediaRole;
  status: PendingMediaStatus;
  progress: number;
  error?: string;
  media?: ListingMedia;
  mediaId?: number;
  previewUrl?: string;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;

type SectorSpecField = {
  key: string;
  label: { ar: string; en: string };
};

const sectorSpecFields: Record<ListingCategory, SectorSpecField[]> = {
  "real-estate": [
    { key: "area", label: { ar: "المساحة", en: "Area" } },
    { key: "property-type", label: { ar: "نوع العقار", en: "Property type" } },
    { key: "rooms", label: { ar: "عدد الغرف", en: "Rooms" } },
    { key: "bathrooms", label: { ar: "عدد الحمامات", en: "Bathrooms" } },
    { key: "floors", label: { ar: "عدد الأدوار", en: "Floors" } },
  ],
  movables: [
    { key: "quantity", label: { ar: "الكمية", en: "Quantity" } },
    { key: "condition", label: { ar: "الحالة", en: "Condition" } },
    { key: "brand", label: { ar: "الماركة", en: "Brand" } },
    { key: "model", label: { ar: "الموديل", en: "Model" } },
  ],
  cars: [
    { key: "make", label: { ar: "الماركة", en: "Make" } },
    { key: "model", label: { ar: "الموديل", en: "Model" } },
    { key: "year", label: { ar: "سنة الصنع", en: "Year" } },
    { key: "mileage", label: { ar: "الكيلومترات", en: "Mileage" } },
    { key: "transmission", label: { ar: "ناقل الحركة", en: "Transmission" } },
  ],
  antiques: [
    { key: "type", label: { ar: "النوع", en: "Type" } },
    { key: "material", label: { ar: "الخامة", en: "Material" } },
    { key: "period", label: { ar: "الحقبة", en: "Period" } },
    { key: "condition", label: { ar: "الحالة", en: "Condition" } },
  ],
  scrap: [
    { key: "material", label: { ar: "الخامة", en: "Material" } },
    { key: "weight", label: { ar: "الوزن", en: "Weight" } },
    { key: "condition", label: { ar: "الحالة", en: "Condition" } },
  ],
  other: [
    { key: "details", label: { ar: "تفاصيل إضافية", en: "Additional details" } },
  ],
};

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
    if (!["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"].includes(contentType)) return "صيغة الفيديو غير مدعومة.";
    if (file.size > MAX_VIDEO_BYTES) return "حجم الفيديو يجب ألا يتجاوز 5 GB.";
    return "";
  }
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) return "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP أو GIF.";
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
  onSubmit: (draft: ListingDraft, media?: ListingSubmissionMedia) => Promise<Listing>;
  onFinished: () => void;
}) {
  const { lang, t, sectors, uploadListingMedia, watchListingMedia, deleteListingMedia } = useApp();
  const [draft, setDraft] = useState<ListingDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [savedListing, setSavedListing] = useState<Listing | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const uploadController = useRef<AbortController | null>(null);
  const pendingMediaRef = useRef<PendingMedia[]>([]);
  const mediaBusy = pendingMedia.some((item) => ["sending", "uploading", "processing"].includes(item.status));

  useEffect(() => {
    pendingMediaRef.current = pendingMedia;
  }, [pendingMedia]);

  useEffect(() => () => {
    uploadController.current?.abort();
    pendingMediaRef.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
  }, []);

  const wizardSteps = [
    { label: lang === "ar" ? "الأساسيات" : "Basics", hint: lang === "ar" ? "العنوان والقسم وحالة الظهور" : "Title, category and visibility", icon: FiEdit3 },
    { label: lang === "ar" ? "تفاصيل الأصل" : "Asset details", hint: lang === "ar" ? "الموقع والقيمة وبيانات القسم" : "Location, value and category fields", icon: FiLayers },
    { label: lang === "ar" ? "جلسة المزاد" : "Auction", hint: lang === "ar" ? "المواعيد والجهة ومكان الجلسة" : "Dates, beneficiary and venue", icon: FiCalendar },
    { label: lang === "ar" ? "المحتوى" : "Content", hint: lang === "ar" ? "الملخص والوصف والملاحظات" : "Summary, description and notes", icon: FiFileText },
    { label: lang === "ar" ? "الصور والفيديو" : "Media", hint: lang === "ar" ? "الغلاف والجاليري والفيديو" : "Cover, gallery and video", icon: FiUploadCloud },
    { label: lang === "ar" ? "المعاينة والنشر" : "Review & publish", hint: lang === "ar" ? "شكل الإعلان ونتيجة البحث" : "Listing and search previews", icon: FiEye },
  ];

  const validateStep = (index: number) => {
    if (index === 0 && !draft.titleAr.trim() && !draft.titleEn.trim()) {
      return lang === "ar" ? "اكتب عنوان المزاد قبل الانتقال للخطوة التالية." : "Add the listing title before continuing.";
    }
    if (index === 1) {
      if (!draft.cityAr.trim() && !draft.cityEn.trim()) return lang === "ar" ? "اكتب المدينة." : "Add the city.";
      if (!draft.locationAr.trim() && !draft.locationEn.trim()) return lang === "ar" ? "اكتب موقع المعاينة." : "Add the inspection location.";
      if (!draft.priceLabelAr.trim() && !draft.priceLabelEn.trim()) return lang === "ar" ? "اكتب قيمة أو طريقة تسعير المزاد." : "Add the auction value or pricing label.";
      if (!draft.measureLabel.trim()) return lang === "ar" ? "اكتب المساحة أو الكمية المختصرة." : "Add the short area or quantity label.";
    }
    if (index === 3) {
      if (!draft.summaryAr.trim() && !draft.summaryEn.trim()) return lang === "ar" ? "اكتب ملخص المزاد." : "Add the listing summary.";
      if (!draft.descriptionAr.trim() && !draft.descriptionEn.trim()) return lang === "ar" ? "اكتب وصف المزاد." : "Add the listing description.";
    }
    if (index === 4 && !listing && !pendingMedia.some((item) => item.role === "thumbnail")) {
      return lang === "ar" ? "اختار الصورة الرئيسية قبل المعاينة والنشر." : "Choose the main image before review and publishing.";
    }
    return "";
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(wizardSteps.length - 1, current + 1));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  };

  const patchDraft = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const changeCategory = (category: ListingCategory) => {
    setDraft((current) => current.category === category
      ? current
      : { ...current, category, specs: [] });
  };

  const specValue = (field: SectorSpecField, language: "ar" | "en") =>
    draft.specs.find((spec) => spec.label.en === field.label.en)?.value[language] ?? "";

  const patchSpec = (field: SectorSpecField, language: "ar" | "en", value: string) => {
    setDraft((current) => {
      const existing = current.specs.find((spec) => spec.label.en === field.label.en);
      const next = existing
        ? current.specs.map((spec) => spec === existing
          ? { ...spec, value: { ...spec.value, [language]: value } }
          : spec)
        : [...current.specs, { label: field.label, value: { ar: "", en: "", [language]: value } }];
      return { ...current, specs: next };
    });
  };

  const patchPending = (key: string, patch: Partial<PendingMedia>) => {
    setPendingMedia((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
  };

  const uploadOne = async (listingId: number, item: PendingMedia) => {
    if (!uploadController.current || uploadController.current.signal.aborted) {
      uploadController.current = new AbortController();
    }
    patchPending(item.key, { status: "sending", progress: 0, error: undefined });
    try {
      const media = await uploadListingMedia(listingId, item.file, item.role, {
        signal: uploadController.current.signal,
        onMedia(serverMedia) {
          patchPending(item.key, {
            status: serverMedia.status,
            progress: serverMedia.progress,
            media: serverMedia,
            mediaId: serverMedia.id,
          });
        },
      });
      patchPending(item.key, { status: media.status, progress: media.progress, media, mediaId: media.id });
      return true;
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") return false;
      patchPending(item.key, {
        status: caught instanceof MediaProcessingFailedError ? "failed" : "error",
        error: requestError(caught, "تعذر رفع الملف أو متابعة حالته."),
      });
      return false;
    }
  };

  const watchOne = async (listingId: number, item: PendingMedia, initialMedia: ListingMedia) => {
    if (!uploadController.current || uploadController.current.signal.aborted) {
      uploadController.current = new AbortController();
    }
    patchPending(item.key, {
      status: initialMedia.status,
      progress: initialMedia.progress,
      media: initialMedia,
      mediaId: initialMedia.id,
      error: undefined,
    });
    try {
      const media = await watchListingMedia(listingId, initialMedia, {
        signal: uploadController.current.signal,
        onMedia(serverMedia) {
          patchPending(item.key, {
            status: serverMedia.status,
            progress: serverMedia.progress,
            media: serverMedia,
            mediaId: serverMedia.id,
          });
        },
      });
      patchPending(item.key, { status: media.status, progress: media.progress, media, mediaId: media.id });
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") return;
      patchPending(item.key, {
        status: caught instanceof MediaProcessingFailedError ? "failed" : "error",
        error: requestError(caught, "تعذر متابعة رفع الملف."),
      });
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < wizardSteps.length - 1) {
      goNext();
      return;
    }
    if (mediaBusy || savedListing) return;
    const selected = pendingMedia.filter((item) => item.status === "selected");
    const thumbnail = selected.find((item) => item.role === "thumbnail");
    if (!listing && !thumbnail) {
      setError(lang === "ar" ? "الصورة الرئيسية مطلوبة قبل نشر المزاد." : "A main image is required before publishing.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const submissionMedia = thumbnail
        ? {
          thumbnail: thumbnail.file,
          gallery: selected.filter((item) => item.role === "gallery").map((item) => item.file),
          video: selected.find((item) => item.role === "video")?.file,
        }
        : undefined;
      const persisted = await onSubmit(draft, listing ? undefined : submissionMedia);
      setSavedListing(persisted);
      setStep(4);
      setSaving(false);
      uploadController.current = new AbortController();
      if (!selected.length) {
        onFinished();
        return;
      }

      if (listing) {
        for (const item of selected) await uploadOne(persisted.id, item);
        return;
      }

      const unmatchedServerMedia = [...(persisted.media ?? [])];
      const monitoring = selected.flatMap((item) => {
        const index = unmatchedServerMedia.findIndex((media) =>
          media.role === item.role && media.fileName === item.file.name);
        if (index < 0) {
          patchPending(item.key, {
            status: "error",
            error: lang === "ar" ? "الخادم لم يُرجع حالة هذا الملف." : "The server did not return this file status.",
          });
          return [];
        }
        const [serverMedia] = unmatchedServerMedia.splice(index, 1);
        return [watchOne(persisted.id, item, serverMedia)];
      });
      await Promise.all(monitoring);
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
    const currentGalleryCount = pendingMedia.filter((item) => item.role === "gallery").length;
    if (role === "gallery" && currentGalleryCount + relevant.length > 20) {
      setError(lang === "ar" ? "يمكن اختيار 20 صورة جاليري بحد أقصى." : "You can select up to 20 gallery images.");
      return;
    }
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
      previewUrl: URL.createObjectURL(file),
    }));
    setError("");
    setPendingMedia((current) => {
      if (role === "gallery") {
        const duplicated = current.filter((item) => entries.some((entry) => entry.key === item.key));
        duplicated.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
        return [...current.filter((item) => !entries.some((entry) => entry.key === item.key)), ...entries];
      }
      current.filter((item) => item.role === role).forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
      return [...current.filter((item) => item.role !== role), ...entries];
    });
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
  const selectedThumbnailPreview = pendingMedia.find((item) => item.role === "thumbnail")?.previewUrl;
  const selectedGalleryPreview = pendingMedia.find((item) => item.role === "gallery")?.previewUrl;
  const previewImage = selectedThumbnailPreview || draft.thumbnail || selectedGalleryPreview || draft.gallery[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=84";
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
          <div className="min-w-48 rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-4 text-xs font-black text-slate-300">
              <span>{lang === "ar" ? "تقدم الإضافة" : "Creation progress"}</span>
              <span>{step + 1}/{wizardSteps.length}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${((step + 1) / wizardSteps.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <nav className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/5" aria-label={lang === "ar" ? "خطوات إضافة المزاد" : "Listing creation steps"}>
        <ol className="grid min-w-[760px] grid-cols-6 gap-2">
          {wizardSteps.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const complete = index < step;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => index < step && setStep(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-start transition ${active ? "bg-slate-950 text-white shadow-lg" : complete ? "bg-emerald-50 text-emerald-900 hover:bg-emerald-100" : "bg-slate-50 text-slate-400"}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-amber-400 text-slate-950" : complete ? "bg-emerald-600 text-white" : "bg-white"}`}>
                    {complete ? <FiCheckCircle /> : <Icon />}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm font-black">{item.label}</strong>
                    <small className={`mt-0.5 block truncate text-[10px] font-bold ${active ? "text-slate-300" : "opacity-70"}`}>{item.hint}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          {step === 0 ? (
          <FormSection title={t.basicData} icon={FiEdit3}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.titleAr} value={draft.titleAr} onChange={(value) => patchDraft("titleAr", value)} required />
              <Field label={t.titleEn} value={draft.titleEn} onChange={(value) => patchDraft("titleEn", value)} />
              <Select label={t.category} value={draft.category} onChange={(value) => changeCategory(value as ListingCategory)}>
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
                {lang === "ar"
                  ? "مميز في الصفحة الرئيسية (الهيرو والكاروسيل)"
                  : "Featured on the home page (hero and carousel)"}
              </label>
            </div>
          </FormSection>
          ) : null}

          {step === 1 ? (
          <>
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

          <FormSection
            title={lang === "ar" ? "بيانات خاصة بنوع المزاد" : "Category-specific details"}
            icon={FiGrid}
          >
            <p className="mb-4 text-sm font-bold leading-7 text-slate-600">
              {lang === "ar"
                ? "تظهر هنا فقط الحقول المناسبة للقسم المختار، ولن تظهر الحقول الفارغة في صفحة المزاد."
                : "Only fields relevant to the selected category appear here; empty fields are not published."}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {sectorSpecFields[draft.category].flatMap((field) => [
                <Field
                  key={`${field.key}-ar`}
                  label={`${field.label.ar} (AR)`}
                  value={specValue(field, "ar")}
                  onChange={(value) => patchSpec(field, "ar", value)}
                />,
                <Field
                  key={`${field.key}-en`}
                  label={`${field.label.en} (EN)`}
                  value={specValue(field, "en")}
                  onChange={(value) => patchSpec(field, "en", value)}
                />,
              ])}
            </div>
          </FormSection>
          </>
          ) : null}

          {step === 2 ? (
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
          ) : null}

          {step === 3 ? (
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
          ) : null}

          {step === 4 ? (
          <FormSection title={t.mediaData} icon={FiUploadCloud}>
            <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold leading-7 text-sky-900">
              {lang === "ar"
                ? "عند الضغط على حفظ ونشر، تُرسل بيانات المزاد والصورة الرئيسية والجاليري والفيديو في طلب واحد. الباك يحفظ المزاد ثم يرفع كل الملفات إلى Cloudinary في الخلفية ويعرض تقدمها هنا."
                : "Save & publish sends the listing, main image, gallery, and video in one request. The backend saves the listing, then uploads every file to Cloudinary in background workers and reports progress here."}
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
                      <small className="mt-1 block font-bold text-slate-500">{media.contentType}{media.expectedBytes ? ` · ${mediaSize(media.uploadedBytes)}/${mediaSize(media.expectedBytes)} · ${media.progress}%` : media.bytes ? ` · ${mediaSize(media.bytes)}` : ""}{media.failureReason ? ` · ${media.failureReason}` : ""}</small>
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
                    <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
                      {item.previewUrl ? (
                        item.role === "video" ? (
                          <video src={item.previewUrl} muted playsInline className="aspect-square w-24 rounded-2xl bg-slate-950 object-cover" />
                        ) : (
                          <LazyImage src={item.previewUrl} alt="" className="aspect-square w-24 rounded-2xl object-cover" />
                        )
                      ) : null}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm font-black text-slate-900">{item.file.name}</strong><MediaBadge value={item.role} /><MediaBadge value={item.status === "error" && item.media ? item.media.status : item.status} />{item.status === "error" && item.media ? <MediaBadge value="client-error" /> : null}</div><small className="mt-1 block font-bold text-slate-500">{mediaContentType(item.file)} · {mediaSize(item.file.size)}</small></div>
                      <div className="flex gap-2">
                        {(item.status === "failed" || item.status === "error") && savedListing ? <button disabled={mediaBusy || deletingMediaId === item.mediaId} type="button" onClick={() => void retryMedia(item)} className="h-10 rounded-xl bg-amber-100 px-4 text-xs font-black text-amber-900">{lang === "ar" ? "إعادة المحاولة" : "Retry"}</button> : null}
                        {item.status === "selected" && !savedListing ? <button type="button" onClick={() => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); setPendingMedia((current) => current.filter((entry) => entry.key !== item.key)); }} className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-black text-slate-700">{lang === "ar" ? "إزالة" : "Remove"}</button> : null}
                      </div>
                      </div>
                    </div>
                    {item.status !== "selected" ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${item.status === "failed" || item.status === "error" ? "bg-rose-500" : item.status === "ready" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${item.status === "failed" || item.status === "error" || item.status === "sending" ? Math.max(4, item.progress) : item.progress}%` }} /></div> : null}
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
          ) : null}

          {step === 5 ? (
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
          ) : null}

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">{error}</div> : null}

          <div className="flex flex-col-reverse justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || saving || mediaBusy || Boolean(savedListing)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {lang === "ar" ? <FiArrowRight /> : <FiArrowLeft />}
              {lang === "ar" ? "الخطوة السابقة" : "Previous step"}
            </button>
            {step < wizardSteps.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={saving || mediaBusy || Boolean(savedListing)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lang === "ar" ? "متابعة للخطوة التالية" : "Continue to the next step"}
                {lang === "ar" ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            ) : (
              <button
                disabled={saving || mediaBusy || Boolean(savedListing)}
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-7 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                {saving ? (lang === "ar" ? "جاري نشر المزاد..." : "Publishing listing...") : submitLabel}
              </button>
            )}
          </div>
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

function AboutContentPanel({ view, content }: { view: DashboardView; content: AboutContent }) {
  const { lang } = useApp();
  const showProfile = view === "about-profile" || view === "about-content";
  const showStructure = view === "about-structure" || view === "about-content";
  const showCertificates = view === "about-certificates" || view === "about-content";
  const showWork = view === "about-work" || view === "about-content";
  return (
    <div className="grid gap-6">
      {showProfile ? <AboutProfileEditor profile={content.profile} /> : null}
      {showStructure ? <OrganizationEditor people={content.people} departments={content.departments} /> : null}
      {showCertificates ? <CertificatesEditor certificates={content.certificates} /> : null}
      {showWork ? <PreviousWorkEditor categories={content.workCategories} /> : null}
      {!showProfile && !showStructure && !showCertificates && !showWork ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-black text-slate-500">
          {lang === "ar" ? "اختر قسمًا من قائمة نبذة الشركة." : "Choose an About section from the menu."}
        </div>
      ) : null}
    </div>
  );
}

type ProfileDraft = {
  headlineAr: string; headlineEn: string; profileAr: string; profileEn: string;
  missionAr: string; missionEn: string; visionAr: string; visionEn: string;
  imageUrl: string; startedYear: string;
};

function profileDraft(profile: AboutProfile): ProfileDraft {
  return {
    headlineAr: profile.headline.ar, headlineEn: profile.headline.en,
    profileAr: profile.profile.ar, profileEn: profile.profile.en,
    missionAr: profile.mission.ar, missionEn: profile.mission.en,
    visionAr: profile.vision.ar, visionEn: profile.vision.en,
    imageUrl: profile.imageUrl || "", startedYear: String(profile.startedYear),
  };
}

function useDeferredImage(initialUrl = "") {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const localPreviewRef = useRef<string | null>(null);

  const releaseLocalPreview = () => {
    if (!localPreviewRef.current) return;
    URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = null;
  };

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    releaseLocalPreview();
    const localPreview = URL.createObjectURL(selected);
    localPreviewRef.current = localPreview;
    setFile(selected);
    setPreviewUrl(localPreview);
    event.target.value = "";
  };

  const reset = (url = "") => {
    releaseLocalPreview();
    setFile(null);
    setPreviewUrl(url);
  };

  useEffect(() => () => releaseLocalPreview(), []);

  return { file, previewUrl, choose, reset };
}

function AboutProfileEditor({ profile }: { profile: AboutProfile }) {
  const { lang, updateAboutProfile, uploadAboutImage } = useApp();
  const [draft, setDraft] = useState(() => profileDraft(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const image = useDeferredImage(profile.imageUrl || "");
  useEffect(() => {
    setDraft(profileDraft(profile));
    image.reset(profile.imageUrl || "");
  }, [profile]);
  const patch = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const imageUrl = image.file ? await uploadAboutImage(image.file) : draft.imageUrl || undefined;
      if (image.file && imageUrl) {
        patch("imageUrl", imageUrl);
        image.reset(imageUrl);
      }
      await updateAboutProfile({
        headline: { ar: draft.headlineAr, en: draft.headlineEn || draft.headlineAr },
        profile: { ar: draft.profileAr, en: draft.profileEn || draft.profileAr },
        mission: { ar: draft.missionAr, en: draft.missionEn || draft.missionAr },
        vision: { ar: draft.visionAr, en: draft.visionEn || draft.visionAr },
        imageUrl,
        startedYear: Number(draft.startedYear),
      });
    } catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ النبذة." : "Could not save the profile.")); }
    finally { setSaving(false); }
  };
  return (
    <Panel title={lang === "ar" ? "نبذة الشركة ورسالتها" : "Company profile and purpose"} icon={FiEdit3}>
      <form onSubmit={submit} className="grid gap-6">
        {error ? <AdminError message={error} /> : null}
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="grid content-start gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            {image.previewUrl ? <LazyImage src={image.previewUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" /> : <ImagePlaceholder />}
            <FileInput label={lang === "ar" ? "صورة النبذة" : "Profile image"} button={lang === "ar" ? "اختيار صورة" : "Choose image"} disabled={saving} onChange={image.choose} />
            {image.file ? <PendingImageNotice file={image.file} lang={lang} /> : null}
            <Field label={lang === "ar" ? "سنة بداية الخبرة" : "Established year"} type="number" value={draft.startedYear} onChange={(value) => patch("startedYear", value)} required />
          </div>
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2"><Field label="العنوان الرئيسي بالعربية" value={draft.headlineAr} onChange={(v) => patch("headlineAr", v)} required /><Field label="Headline in English" value={draft.headlineEn} onChange={(v) => patch("headlineEn", v)} required /></div>
            <div className="grid gap-4 lg:grid-cols-2"><Textarea label="نبذة الشركة بالعربية" value={draft.profileAr} onChange={(v) => patch("profileAr", v)} /><Textarea label="Company profile in English" value={draft.profileEn} onChange={(v) => patch("profileEn", v)} /></div>
            <div className="grid gap-4 lg:grid-cols-2"><Textarea label="الرسالة بالعربية" value={draft.missionAr} onChange={(v) => patch("missionAr", v)} /><Textarea label="Mission in English" value={draft.missionEn} onChange={(v) => patch("missionEn", v)} /></div>
            <div className="grid gap-4 lg:grid-cols-2"><Textarea label="الرؤية بالعربية" value={draft.visionAr} onChange={(v) => patch("visionAr", v)} /><Textarea label="Vision in English" value={draft.visionEn} onChange={(v) => patch("visionEn", v)} /></div>
          </div>
        </div>
        <Button type="submit" icon={saving ? FiLoader : FiSave} disabled={saving}>{lang === "ar" ? "حفظ نبذة الشركة" : "Save company profile"}</Button>
      </form>
    </Panel>
  );
}

type PersonDraft = { nameAr: string; nameEn: string; roleAr: string; roleEn: string; biographyAr: string; biographyEn: string; imageUrl: string; displayOrder: string; active: boolean };
const emptyPerson: PersonDraft = { nameAr: "", nameEn: "", roleAr: "", roleEn: "", biographyAr: "", biographyEn: "", imageUrl: "", displayOrder: "0", active: true };
function personDraft(person?: AboutPerson): PersonDraft { return person ? { nameAr: person.name.ar, nameEn: person.name.en, roleAr: person.role.ar, roleEn: person.role.en, biographyAr: person.biography.ar, biographyEn: person.biography.en, imageUrl: person.imageUrl || "", displayOrder: String(person.displayOrder), active: person.active } : { ...emptyPerson }; }

type DepartmentDraft = { titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string; displayOrder: string };
const emptyDepartment: DepartmentDraft = { titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", displayOrder: "0" };
function departmentDraft(item?: AboutDepartment): DepartmentDraft { return item ? { titleAr: item.title.ar, titleEn: item.title.en, descriptionAr: item.description.ar, descriptionEn: item.description.en, displayOrder: String(item.displayOrder) } : { ...emptyDepartment }; }

function OrganizationEditor({ people, departments }: { people: AboutPerson[]; departments: AboutDepartment[] }) {
  const { lang, createAboutPerson, updateAboutPerson, deleteAboutPerson, createAboutDepartment, updateAboutDepartment, deleteAboutDepartment, uploadAboutImage } = useApp();
  const [person, setPerson] = useState<PersonDraft>({ ...emptyPerson });
  const [personId, setPersonId] = useState<number | null>(null);
  const [department, setDepartment] = useState<DepartmentDraft>({ ...emptyDepartment });
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const personImage = useDeferredImage();
  const pPatch = <K extends keyof PersonDraft>(key: K, value: PersonDraft[K]) => setPerson((current) => ({ ...current, [key]: value }));
  const dPatch = <K extends keyof DepartmentDraft>(key: K, value: DepartmentDraft[K]) => setDepartment((current) => ({ ...current, [key]: value }));
  const resetPerson = () => { setPersonId(null); setPerson({ ...emptyPerson, displayOrder: String(people.length) }); personImage.reset(); };
  const editPerson = (item: AboutPerson) => { setPersonId(item.id); setPerson(personDraft(item)); personImage.reset(item.imageUrl || ""); };
  const resetDepartment = () => { setDepartmentId(null); setDepartment({ ...emptyDepartment, displayOrder: String(departments.length) }); };
  const savePerson = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const imageUrl = personImage.file ? await uploadAboutImage(personImage.file) : person.imageUrl || undefined;
      if (personImage.file && imageUrl) {
        pPatch("imageUrl", imageUrl);
        personImage.reset(imageUrl);
      }
      const payload = { name: { ar: person.nameAr, en: person.nameEn || person.nameAr }, role: { ar: person.roleAr, en: person.roleEn || person.roleAr }, biography: { ar: person.biographyAr, en: person.biographyEn || person.biographyAr }, imageUrl, displayOrder: Number(person.displayOrder), active: person.active };
      personId ? await updateAboutPerson(personId, payload) : await createAboutPerson(payload);
      resetPerson();
    }
    catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ الشخص." : "Could not save the person.")); }
    finally { setBusy(false); }
  };
  const saveDepartment = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { title: { ar: department.titleAr, en: department.titleEn || department.titleAr }, description: { ar: department.descriptionAr, en: department.descriptionEn || department.descriptionAr }, displayOrder: Number(department.displayOrder) };
    try { departmentId ? await updateAboutDepartment(departmentId, payload) : await createAboutDepartment(payload); resetDepartment(); }
    catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ الإدارة." : "Could not save the department.")); }
    finally { setBusy(false); }
  };
  const removePerson = async (id: number) => { if (!confirmDeleteAbout(lang, "person")) return; setBusy(true); try { await deleteAboutPerson(id); if (personId === id) resetPerson(); } catch (caught) { setError(requestError(caught, "Could not delete.")); } finally { setBusy(false); } };
  const removeDepartment = async (id: number) => { if (!confirmDeleteAbout(lang, "department")) return; setBusy(true); try { await deleteAboutDepartment(id); if (departmentId === id) resetDepartment(); } catch (caught) { setError(requestError(caught, "Could not delete.")); } finally { setBusy(false); } };
  return (
    <div className="grid gap-6">
      {error ? <AdminError message={error} /> : null}
      <Panel title={lang === "ar" ? "الأشخاص والخبراء" : "People and experts"} icon={FiUsers}>
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {people.map((item) => <article key={item.id} className={`overflow-hidden rounded-3xl border bg-white ${item.active ? "border-slate-200" : "border-amber-300 opacity-75"}`}>
              <div className="grid grid-cols-[92px_1fr] items-stretch">
                {item.imageUrl ? <LazyImage src={item.imageUrl} alt="" className="h-full min-h-32 w-full object-cover object-top" /> : <div className="grid min-h-32 place-items-center bg-emerald-950 text-3xl font-black text-amber-300">{item.name[lang].charAt(0)}</div>}
                <div className="p-4"><strong className="block text-base font-black text-slate-950">{item.name[lang]}</strong><small className="mt-1 block font-bold text-amber-700">{item.role[lang]}</small><p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.biography[lang]}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3"><button type="button" onClick={() => editPerson(item)} className="h-10 rounded-xl border text-xs font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button type="button" disabled={busy} onClick={() => void removePerson(item.id)} className="grid h-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div>
            </article>)}
          </div>
          <form onSubmit={savePerson} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <EditorTitle editing={Boolean(personId)} lang={lang} nounAr="شخص" nounEn="person" onCancel={resetPerson} />
            {personImage.previewUrl ? <LazyImage src={personImage.previewUrl} alt="" className="h-44 w-full rounded-2xl object-cover object-top" /> : <ImagePlaceholder />}
            <FileInput label={lang === "ar" ? "صورة الشخص" : "Person photo"} button={lang === "ar" ? "اختيار صورة" : "Choose photo"} disabled={busy} onChange={personImage.choose} />
            {personImage.file ? <PendingImageNotice file={personImage.file} lang={lang} /> : null}
            <div className="grid gap-3 sm:grid-cols-2"><Field label="الاسم بالعربية" value={person.nameAr} onChange={(v) => pPatch("nameAr", v)} required /><Field label="Name in English" value={person.nameEn} onChange={(v) => pPatch("nameEn", v)} required /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="الدور بالعربية" value={person.roleAr} onChange={(v) => pPatch("roleAr", v)} required /><Field label="Role in English" value={person.roleEn} onChange={(v) => pPatch("roleEn", v)} required /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Textarea label="نبذة بالعربية" value={person.biographyAr} onChange={(v) => pPatch("biographyAr", v)} /><Textarea label="Biography in English" value={person.biographyEn} onChange={(v) => pPatch("biographyEn", v)} /></div>
            <Field label={lang === "ar" ? "ترتيب الظهور" : "Display order"} type="number" value={person.displayOrder} onChange={(v) => pPatch("displayOrder", v)} required />
            <label className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-black"><input type="checkbox" checked={person.active} onChange={(e) => pPatch("active", e.target.checked)} />{lang === "ar" ? "ظاهر في الموقع" : "Visible on website"}</label>
            <Button type="submit" icon={busy ? FiLoader : FiSave} disabled={busy}>{lang === "ar" ? "حفظ الشخص" : "Save person"}</Button>
          </form>
        </div>
      </Panel>
      <Panel title={lang === "ar" ? "الإدارات والقطاعات" : "Departments and sectors"} icon={FiLayers}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid content-start gap-3 md:grid-cols-2">{departments.map((item) => <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><strong className="text-lg font-black">{item.title[lang]}</strong><p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.description[lang]}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black">{item.displayOrder}</span></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setDepartmentId(item.id); setDepartment(departmentDraft(item)); }} className="h-10 flex-1 rounded-xl border text-xs font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button type="button" onClick={() => void removeDepartment(item.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div></article>)}</div>
          <form onSubmit={saveDepartment} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"><EditorTitle editing={Boolean(departmentId)} lang={lang} nounAr="إدارة" nounEn="department" onCancel={resetDepartment} /><Field label="اسم الإدارة بالعربية" value={department.titleAr} onChange={(v) => dPatch("titleAr", v)} required /><Field label="Department in English" value={department.titleEn} onChange={(v) => dPatch("titleEn", v)} required /><Textarea label="الوصف بالعربية" value={department.descriptionAr} onChange={(v) => dPatch("descriptionAr", v)} /><Textarea label="Description in English" value={department.descriptionEn} onChange={(v) => dPatch("descriptionEn", v)} /><Field label={lang === "ar" ? "ترتيب الظهور" : "Display order"} type="number" value={department.displayOrder} onChange={(v) => dPatch("displayOrder", v)} required /><Button type="submit" icon={busy ? FiLoader : FiSave} disabled={busy}>{lang === "ar" ? "حفظ الإدارة" : "Save department"}</Button></form>
        </div>
      </Panel>
    </div>
  );
}

type CertificateDraftNew = { titleAr: string; titleEn: string; issuerAr: string; issuerEn: string; descriptionAr: string; descriptionEn: string; issueDate: string; imageUrl: string; displayOrder: string };
const emptyCertificateNew: CertificateDraftNew = { titleAr: "", titleEn: "", issuerAr: "", issuerEn: "", descriptionAr: "", descriptionEn: "", issueDate: "", imageUrl: "", displayOrder: "0" };
function certificateDraftNew(item?: Certificate): CertificateDraftNew { return item ? { titleAr: item.title.ar, titleEn: item.title.en, issuerAr: item.issuer.ar, issuerEn: item.issuer.en, descriptionAr: item.description.ar, descriptionEn: item.description.en, issueDate: item.issueDate || "", imageUrl: item.imageUrl || "", displayOrder: String(item.displayOrder) } : { ...emptyCertificateNew }; }

function CertificatesEditor({ certificates }: { certificates: Certificate[] }) {
  const { lang, createCertificate, updateCertificate, deleteCertificate, uploadAboutImage } = useApp();
  const [draft, setDraft] = useState<CertificateDraftNew>({ ...emptyCertificateNew });
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const image = useDeferredImage();
  const patch = <K extends keyof CertificateDraftNew>(key: K, value: CertificateDraftNew[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditing(null); setDraft({ ...emptyCertificateNew, displayOrder: String(certificates.length) }); image.reset(); };
  const edit = (item: Certificate) => { setEditing(item.id); setDraft(certificateDraftNew(item)); image.reset(item.imageUrl || ""); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const imageUrl = image.file ? await uploadAboutImage(image.file) : draft.imageUrl || undefined;
      if (image.file && imageUrl) {
        patch("imageUrl", imageUrl);
        image.reset(imageUrl);
      }
      const payload = { title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr }, issuer: { ar: draft.issuerAr, en: draft.issuerEn || draft.issuerAr }, description: { ar: draft.descriptionAr, en: draft.descriptionEn || draft.descriptionAr }, issueDate: draft.issueDate || undefined, imageUrl, displayOrder: Number(draft.displayOrder) };
      editing ? await updateCertificate(editing, payload) : await createCertificate(payload);
      reset();
    } catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ الشهادة." : "Could not save certificate.")); }
    finally { setBusy(false); }
  };
  const remove = async (id: number) => { if (!confirmDeleteAbout(lang, "certificate")) return; setBusy(true); try { await deleteCertificate(id); if (editing === id) reset(); } catch (caught) { setError(requestError(caught, "Could not delete.")); } finally { setBusy(false); } };
  return <Panel title={lang === "ar" ? "شهادات التقدير" : "Certificates and recognition"} icon={FiFileText}><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">{error ? <div className="xl:col-span-2"><AdminError message={error} /></div> : null}<div className="grid content-start gap-4 md:grid-cols-2">{certificates.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">{item.imageUrl ? <LazyImage src={item.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" /> : <ImagePlaceholder />}<div className="p-5"><small className="font-black text-amber-700">{item.issueDate?.slice(0, 4) || "—"} · {item.issuer[lang]}</small><strong className="mt-2 block text-lg font-black">{item.title[lang]}</strong><p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{item.description[lang]}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => edit(item)} className="h-10 rounded-xl border text-xs font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button type="button" onClick={() => void remove(item.id)} className="grid h-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div></div></article>)}</div><form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"><EditorTitle editing={Boolean(editing)} lang={lang} nounAr="شهادة" nounEn="certificate" onCancel={reset} />{image.previewUrl ? <LazyImage src={image.previewUrl} alt="" className="h-48 w-full rounded-2xl object-cover" /> : <ImagePlaceholder />}<FileInput label={lang === "ar" ? "صورة الشهادة" : "Certificate image"} button={lang === "ar" ? "اختيار صورة" : "Choose image"} disabled={busy} onChange={image.choose} />{image.file ? <PendingImageNotice file={image.file} lang={lang} /> : null}<div className="grid gap-3 sm:grid-cols-2"><Field label="عنوان الشهادة بالعربية" value={draft.titleAr} onChange={(v) => patch("titleAr", v)} required /><Field label="Title in English" value={draft.titleEn} onChange={(v) => patch("titleEn", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="الجهة المانحة بالعربية" value={draft.issuerAr} onChange={(v) => patch("issuerAr", v)} required /><Field label="Issuer in English" value={draft.issuerEn} onChange={(v) => patch("issuerEn", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Field label={lang === "ar" ? "تاريخ الشهادة" : "Issue date"} type="date" value={draft.issueDate} onChange={(v) => patch("issueDate", v)} /><Field label={lang === "ar" ? "ترتيب الظهور" : "Display order"} type="number" value={draft.displayOrder} onChange={(v) => patch("displayOrder", v)} required /></div><Textarea label="الوصف بالعربية" value={draft.descriptionAr} onChange={(v) => patch("descriptionAr", v)} /><Textarea label="Description in English" value={draft.descriptionEn} onChange={(v) => patch("descriptionEn", v)} /><Button type="submit" icon={busy ? FiLoader : FiSave} disabled={busy}>{lang === "ar" ? "حفظ الشهادة" : "Save certificate"}</Button></form></div></Panel>;
}

type CategoryDraftNew = { titleAr: string; titleEn: string; summaryAr: string; summaryEn: string; displayOrder: string };
const emptyCategoryNew: CategoryDraftNew = { titleAr: "", titleEn: "", summaryAr: "", summaryEn: "", displayOrder: "0" };
function categoryDraftNew(item?: WorkCategory): CategoryDraftNew { return item ? { titleAr: item.title.ar, titleEn: item.title.en, summaryAr: item.summary.ar, summaryEn: item.summary.en, displayOrder: String(item.displayOrder) } : { ...emptyCategoryNew }; }
type EntryDraft = { categoryId: string; titleAr: string; titleEn: string; clientAr: string; clientEn: string; summaryAr: string; summaryEn: string; detailsAr: string; detailsEn: string; locationAr: string; locationEn: string; projectYear: string; imageUrl: string; displayOrder: string };
const emptyEntry: EntryDraft = { categoryId: "", titleAr: "", titleEn: "", clientAr: "", clientEn: "", summaryAr: "", summaryEn: "", detailsAr: "", detailsEn: "", locationAr: "", locationEn: "", projectYear: "", imageUrl: "", displayOrder: "0" };
function entryDraft(item?: WorkEntry): EntryDraft { return item ? { categoryId: String(item.categoryId), titleAr: item.title.ar, titleEn: item.title.en, clientAr: item.client.ar, clientEn: item.client.en, summaryAr: item.summary.ar, summaryEn: item.summary.en, detailsAr: item.details.ar, detailsEn: item.details.en, locationAr: item.location.ar, locationEn: item.location.en, projectYear: item.projectYear ? String(item.projectYear) : "", imageUrl: item.imageUrl || "", displayOrder: String(item.displayOrder) } : { ...emptyEntry }; }

function PreviousWorkEditor({ categories }: { categories: WorkCategory[] }) {
  const { lang, createWorkCategory, updateWorkCategory, deleteWorkCategory, createWorkEntry, updateWorkEntry, deleteWorkEntry, uploadAboutImage } = useApp();
  const [category, setCategory] = useState<CategoryDraftNew>({ ...emptyCategoryNew }); const [categoryId, setCategoryId] = useState<number | null>(null); const [entry, setEntry] = useState<EntryDraft>(() => ({ ...emptyEntry, categoryId: categories[0] ? String(categories[0].id) : "" })); const [entryId, setEntryId] = useState<number | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const entryImage = useDeferredImage();
  const entries = categories.flatMap((item) => item.entries);
  useEffect(() => { if (!entry.categoryId && categories[0]) setEntry((current) => ({ ...current, categoryId: String(categories[0].id) })); }, [categories, entry.categoryId]);
  const cPatch = <K extends keyof CategoryDraftNew>(key: K, value: CategoryDraftNew[K]) => setCategory((current) => ({ ...current, [key]: value })); const ePatch = <K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) => setEntry((current) => ({ ...current, [key]: value })); const resetCategory = () => { setCategoryId(null); setCategory({ ...emptyCategoryNew, displayOrder: String(categories.length) }); }; const resetEntry = () => { setEntryId(null); setEntry({ ...emptyEntry, categoryId: categories[0] ? String(categories[0].id) : "", displayOrder: String(entries.length) }); entryImage.reset(); };
  const editEntry = (item: WorkEntry) => { setEntryId(item.id); setEntry(entryDraft(item)); entryImage.reset(item.imageUrl || ""); };
  const saveCategory = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(""); const payload = { title: { ar: category.titleAr, en: category.titleEn || category.titleAr }, summary: { ar: category.summaryAr, en: category.summaryEn || category.summaryAr }, displayOrder: Number(category.displayOrder) }; try { categoryId ? await updateWorkCategory(categoryId, payload) : await createWorkCategory(payload); resetCategory(); } catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ التصنيف." : "Could not save category.")); } finally { setBusy(false); } };
  const saveEntry = async (event: FormEvent) => { event.preventDefault(); if (!entry.categoryId) { setError(lang === "ar" ? "أضف تصنيفًا واختره أولًا." : "Add and select a category first."); return; } setBusy(true); setError(""); try { const imageUrl = entryImage.file ? await uploadAboutImage(entryImage.file) : entry.imageUrl || undefined; if (entryImage.file && imageUrl) { ePatch("imageUrl", imageUrl); entryImage.reset(imageUrl); } const payload = { title: { ar: entry.titleAr, en: entry.titleEn || entry.titleAr }, client: { ar: entry.clientAr, en: entry.clientEn || entry.clientAr }, summary: { ar: entry.summaryAr, en: entry.summaryEn || entry.summaryAr }, details: { ar: entry.detailsAr, en: entry.detailsEn || entry.detailsAr }, projectYear: entry.projectYear ? Number(entry.projectYear) : undefined, location: { ar: entry.locationAr, en: entry.locationEn || entry.locationAr }, imageUrl, displayOrder: Number(entry.displayOrder) }; entryId ? await updateWorkEntry(entryId, payload) : await createWorkEntry(Number(entry.categoryId), payload); resetEntry(); } catch (caught) { setError(requestError(caught, lang === "ar" ? "تعذر حفظ المشروع." : "Could not save project.")); } finally { setBusy(false); } };
  const removeCategory = async (id: number) => { if (!confirmDeleteAbout(lang, "category")) return; setBusy(true); try { await deleteWorkCategory(id); if (categoryId === id) resetCategory(); } catch (caught) { setError(requestError(caught, "Could not delete.")); } finally { setBusy(false); } }; const removeEntry = async (id: number) => { if (!confirmDeleteAbout(lang, "entry")) return; setBusy(true); try { await deleteWorkEntry(id); if (entryId === id) resetEntry(); } catch (caught) { setError(requestError(caught, "Could not delete.")); } finally { setBusy(false); } };
  return <div className="grid gap-6">{error ? <AdminError message={error} /> : null}<Panel title={lang === "ar" ? "تصنيفات سابقة الأعمال" : "Previous-work categories"} icon={FiFolderPlus}><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"><div className="grid content-start gap-3 md:grid-cols-2">{categories.map((item) => <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><strong className="text-lg font-black">{item.title[lang]}</strong><p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{item.summary[lang]}</p><small className="mt-3 block font-black text-amber-700">{item.entries.length} {lang === "ar" ? "مشروع" : "projects"}</small></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black">{item.displayOrder}</span></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setCategoryId(item.id); setCategory(categoryDraftNew(item)); }} className="h-10 flex-1 rounded-xl border text-xs font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button type="button" onClick={() => void removeCategory(item.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div></article>)}</div><form onSubmit={saveCategory} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"><EditorTitle editing={Boolean(categoryId)} lang={lang} nounAr="تصنيف" nounEn="category" onCancel={resetCategory} /><Field label="اسم التصنيف بالعربية" value={category.titleAr} onChange={(v) => cPatch("titleAr", v)} required /><Field label="Category in English" value={category.titleEn} onChange={(v) => cPatch("titleEn", v)} required /><Textarea label="ملخص التصنيف بالعربية" value={category.summaryAr} onChange={(v) => cPatch("summaryAr", v)} /><Textarea label="Category summary in English" value={category.summaryEn} onChange={(v) => cPatch("summaryEn", v)} /><Field label={lang === "ar" ? "ترتيب الظهور" : "Display order"} type="number" value={category.displayOrder} onChange={(v) => cPatch("displayOrder", v)} required /><Button type="submit" icon={busy ? FiLoader : FiSave} disabled={busy}>{lang === "ar" ? "حفظ التصنيف" : "Save category"}</Button></form></div></Panel><Panel title={lang === "ar" ? "المشروعات والتفاصيل" : "Projects and details"} icon={FiBriefcase}><div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_500px]"><div className="grid content-start gap-4 md:grid-cols-2">{entries.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">{item.imageUrl ? <LazyImage src={item.imageUrl} alt="" className="aspect-[16/8] w-full object-cover" /> : null}<div className="p-5"><small className="font-black text-amber-700">{item.client[lang]} {item.projectYear ? `· ${item.projectYear}` : ""}</small><strong className="mt-2 block text-lg font-black">{item.title[lang]}</strong><p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{item.summary[lang]}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => editEntry(item)} className="h-10 rounded-xl border text-xs font-black">{lang === "ar" ? "تعديل" : "Edit"}</button><button type="button" onClick={() => void removeEntry(item.id)} className="grid h-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FiTrash2 /></button></div></div></article>)}</div><form onSubmit={saveEntry} className="grid h-fit gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"><EditorTitle editing={Boolean(entryId)} lang={lang} nounAr="مشروع" nounEn="project" onCancel={resetEntry} /><Select label={lang === "ar" ? "التصنيف" : "Category"} value={entry.categoryId} onChange={(v) => ePatch("categoryId", v)}>{!categories.length ? <option value="">{lang === "ar" ? "أضف تصنيفًا أولًا" : "Add a category first"}</option> : null}{categories.map((item) => <option key={item.id} value={item.id}>{item.title[lang]}</option>)}</Select>{entryImage.previewUrl ? <LazyImage src={entryImage.previewUrl} alt="" className="h-44 w-full rounded-2xl object-cover" /> : <ImagePlaceholder />}<FileInput label={lang === "ar" ? "صورة المشروع" : "Project image"} button={lang === "ar" ? "اختيار صورة" : "Choose image"} disabled={busy} onChange={entryImage.choose} />{entryImage.file ? <PendingImageNotice file={entryImage.file} lang={lang} /> : null}<div className="grid gap-3 sm:grid-cols-2"><Field label="اسم المشروع بالعربية" value={entry.titleAr} onChange={(v) => ePatch("titleAr", v)} required /><Field label="Project in English" value={entry.titleEn} onChange={(v) => ePatch("titleEn", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="العميل بالعربية" value={entry.clientAr} onChange={(v) => ePatch("clientAr", v)} required /><Field label="Client in English" value={entry.clientEn} onChange={(v) => ePatch("clientEn", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="الموقع بالعربية" value={entry.locationAr} onChange={(v) => ePatch("locationAr", v)} required /><Field label="Location in English" value={entry.locationEn} onChange={(v) => ePatch("locationEn", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Field label={lang === "ar" ? "سنة المشروع" : "Project year"} type="number" value={entry.projectYear} onChange={(v) => ePatch("projectYear", v)} /><Field label={lang === "ar" ? "ترتيب الظهور" : "Display order"} type="number" value={entry.displayOrder} onChange={(v) => ePatch("displayOrder", v)} required /></div><div className="grid gap-3 sm:grid-cols-2"><Textarea label="الملخص بالعربية" value={entry.summaryAr} onChange={(v) => ePatch("summaryAr", v)} /><Textarea label="Summary in English" value={entry.summaryEn} onChange={(v) => ePatch("summaryEn", v)} /></div><div className="grid gap-3 sm:grid-cols-2"><Textarea label="التفاصيل بالعربية" value={entry.detailsAr} onChange={(v) => ePatch("detailsAr", v)} /><Textarea label="Details in English" value={entry.detailsEn} onChange={(v) => ePatch("detailsEn", v)} /></div><Button type="submit" icon={busy ? FiLoader : FiSave} disabled={busy}>{lang === "ar" ? "حفظ المشروع" : "Save project"}</Button></form></div></Panel></div>;
}

function EditorTitle({ editing, lang, nounAr, nounEn, onCancel }: { editing: boolean; lang: "ar" | "en"; nounAr: string; nounEn: string; onCancel: () => void }) { return <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">{lang === "ar" ? `${editing ? "تعديل" : "إضافة"} ${nounAr}` : `${editing ? "Edit" : "Add"} ${nounEn}`}</h3>{editing ? <button type="button" onClick={onCancel} className="rounded-full border bg-white px-4 py-2 text-xs font-black text-slate-500">{lang === "ar" ? "إلغاء" : "Cancel"}</button> : null}</div>; }
function PendingImageNotice({ file, lang }: { file: File; lang: "ar" | "en" }) { return <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">{lang === "ar" ? `تم اختيار ${file.name} — لن تُرفع إلا عند الحفظ.` : `${file.name} selected — it will upload only when you save.`}</p>; }
function ImagePlaceholder() { return <div className="grid h-36 place-items-center rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-800 text-4xl text-amber-300"><FiUploadCloud /></div>; }
function AdminError({ message }: { message: string }) { return <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"><FiAlertCircle />{message}</div>; }
function confirmDeleteAbout(lang: "ar" | "en", type: string) { return window.confirm(lang === "ar" ? "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذه الخطوة." : `Delete this ${type}? This cannot be undone.`); }

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

function SettingsPanel({ settings, onSubmit }: { settings: AppSettings; onSubmit: (settings: AppSettings) => Promise<AppSettings> }) {
  const { lang, t, sectors } = useApp();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const previewAuctionTitle = lang === "ar" ? "مزاد عقاري" : "Property auction";
  const activeTemplate = lang === "ar" ? draft.whatsappMessageAr : draft.whatsappMessageEn;
  const preview = (activeTemplate || "{title}")
    .replace(/\{title\}/g, previewAuctionTitle)
    .replace(/\{category\}/g, getSectorTitle(sectors, "real-estate", lang))
    .replace(/\{id\}/g, "1");

  const patch = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => setDraft(settings), [settings]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      setDraft(await onSubmit(draft));
    } catch (caught) {
      setError(requestError(caught, lang === "ar" ? "تعذر حفظ الإعدادات." : "Could not save settings."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Panel title={t.communicationSettings} icon={FiSettings} action={<Button type="submit" icon={saving ? FiLoader : FiSave} disabled={saving}>{saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : t.saveSettings}</Button>}>
        <div className="grid gap-6">
          {error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}
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
    : value === "failed" || value === "error" || value === "client-error"
      ? "bg-rose-100 text-rose-800"
      : value === "sending" || value === "uploading" || value === "processing"
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

function Button({ children, icon: Icon, onClick, type = "button", disabled = false }: { children: ReactNode; icon: IconType; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
      <Icon className={disabled ? "animate-spin" : undefined} />
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
