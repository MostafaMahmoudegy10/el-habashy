import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFileText,
  FiImage,
  FiLayers,
  FiMessageCircle,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { categoryLabel, requestStatusLabel, statusLabel } from "../lib/i18n";
import { listingToDraft, useApp } from "../context/AppContext";
import { LazyImage } from "../components/LazyImage";
import { RichTextEditor } from "../components/RichTextEditor";
import type { DashboardView, Listing, ListingCategory, ListingDraft, ListingStatus, RequestStatus } from "../types";

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

export function DashboardPage() {
  const {
    lang,
    t,
    listings,
    requests,
    users,
    dashboardView,
    selectedRequest,
    setDashboardView,
    selectListing,
    selectRequest,
    addListing,
    updateListing,
    deleteListing,
    updateListingStatus,
    updateRequestStatus,
    updateRequestNotes,
    getWhatsAppUrl,
  } = useApp();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null);
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const totalRequests = listings.reduce((sum, listing) => sum + listing.bookletRequests, 0);
  const totalWhatsapp = listings.reduce((sum, listing) => sum + listing.whatsappClicks, 0);
  const mostViewed = useMemo(() => [...listings].sort((a, b) => b.views - a.views)[0], [listings]);

  const openEdit = (id: number) => {
    setEditingId(id);
    setDashboardView("edit");
  };

  const nav: Array<{ id: DashboardView; label: string; icon: IconType }> = [
    { id: "overview", label: t.overview, icon: FiBarChart2 },
    { id: "listings", label: t.manageListings, icon: FiLayers },
    { id: "create", label: t.createListing, icon: FiPlus },
    { id: "requests", label: t.requests, icon: FiFileText },
    { id: "users", label: t.users, icon: FiUsers },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-10">
      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/20 lg:sticky lg:top-28">
        <div className="p-3">
          <span className="text-xs font-black uppercase text-amber-300">{t.dashboard}</span>
          <h1 className="mt-2 text-2xl font-black">{lang === "ar" ? "مركز الإدارة" : "Command center"}</h1>
        </div>
        <div className="mt-3 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = dashboardView === item.id || (dashboardView === "edit" && item.id === "listings") || (dashboardView === "request-details" && item.id === "requests");
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
        </div>
      </aside>

      <div className="grid gap-6">
        {dashboardView === "overview" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Stat icon={FiLayers} label={t.totalListings} value={listings.length} />
              <Stat icon={FiEye} label={t.activeListings} value={activeCount} />
              <Stat icon={FiFileText} label={t.bookletRequests} value={totalRequests} />
              <Stat icon={FaWhatsapp} label={t.whatsappClicks} value={totalWhatsapp} />
              <Stat icon={FiBarChart2} label={t.mostViewedListing} value={mostViewed?.views ?? 0} hint={mostViewed?.title[lang]} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <Panel title={t.mostViewedListing} icon={FiBarChart2}>
                {mostViewed ? (
                  <button type="button" onClick={() => selectListing(mostViewed.id)} className="grid w-full gap-4 rounded-3xl bg-slate-50 p-3 text-start md:grid-cols-[180px_minmax(0,1fr)]">
                    <LazyImage src={mostViewed.images[0]} alt="" className="h-44 w-full rounded-2xl object-cover" />
                    <span className="py-2">
                      <strong className="block text-2xl font-black text-slate-950">{mostViewed.title[lang]}</strong>
                      <small className="mt-3 block text-sm font-bold leading-6 text-slate-500">{mostViewed.summary[lang]}</small>
                    </span>
                  </button>
                ) : null}
              </Panel>
              <Panel title={t.requests} icon={FiFileText}>
                <div className="grid gap-3">
                  {requests.slice(0, 4).map((request) => (
                    <button key={request.id} type="button" onClick={() => selectRequest(request.id)} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-start">
                      <strong className="block text-sm font-black text-slate-950">{request.fullName}</strong>
                      <span className="mt-1 block text-xs font-bold text-slate-500">{request.email}</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        ) : null}

        {dashboardView === "listings" ? (
          <Panel title={t.manageListings} icon={FiLayers} action={<Button onClick={() => setDashboardView("create")} icon={FiPlus}>{t.createListing}</Button>}>
            <div className="grid gap-3">
              {listings.map((listing) => (
                <div key={listing.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[110px_minmax(0,1fr)_auto] lg:items-center">
                  <LazyImage src={listing.images[0]} alt="" className="h-28 w-full rounded-2xl object-cover lg:w-28" />
                  <div>
                    <strong className="line-clamp-1 text-lg font-black text-slate-950">{listing.title[lang]}</strong>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-slate-500">
                      <span>{categoryLabel[listing.category][lang]}</span>
                      <span>{listing.city[lang]}</span>
                      <span>{listing.views} {lang === "ar" ? "مشاهدة" : "views"}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <select
                      value={listing.status}
                      onChange={(event) => updateListingStatus(listing.id, event.target.value as ListingStatus)}
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
            </div>
          </Panel>
        ) : null}

        {dashboardView === "create" ? (
          <ListingForm title={t.createListing} submitLabel={t.saveListing} onSubmit={addListing} />
        ) : null}

        {dashboardView === "edit" ? (
          <ListingForm
            title={t.editListing}
            submitLabel={t.updateListing}
            initial={listingToDraft(listings.find((listing) => listing.id === editingId))}
            onSubmit={(draft) => {
              if (editingId) updateListing(editingId, draft);
              setDashboardView("listings");
            }}
          />
        ) : null}

        {dashboardView === "requests" ? (
          <Panel title={t.requests} icon={FiFileText}>
            <div className="grid gap-3">
              {requests.map((request) => {
                const listing = listings.find((item) => item.id === request.listingId);
                return (
                  <button key={request.id} type="button" onClick={() => selectRequest(request.id)} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-start shadow-sm md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-center">
                    <span>
                      <strong className="block text-lg font-black text-slate-950">{request.fullName}</strong>
                      <small className="mt-1 block text-sm font-bold text-slate-500">{listing?.title[lang]} · {request.email}</small>
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-center text-xs font-black text-amber-800">
                      {requestStatusLabel[request.status][lang]}
                    </span>
                    <span className="text-sm font-black text-slate-500">{request.createdAt}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        ) : null}

        {dashboardView === "request-details" && selectedRequest ? (
          <Panel title={t.requestDetails} icon={FiFileText}>
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h2 className="text-2xl font-black text-slate-950">{selectedRequest.fullName}</h2>
                <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600">
                  <span>{selectedRequest.email}</span>
                  <span>{selectedRequest.whatsapp}</span>
                  <span>{selectedRequest.notes || t.emptyState}</span>
                </div>
                <label className="mt-5 grid gap-2 text-sm font-black text-slate-700">
                  {t.internalNotes}
                  <textarea
                    value={selectedRequest.internalNotes}
                    onChange={(event) => updateRequestNotes(selectedRequest.id, event.target.value)}
                    className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
                  />
                </label>
              </div>
              <div className="grid content-start gap-3">
                <select
                  value={selectedRequest.status}
                  onChange={(event) => updateRequestStatus(selectedRequest.id, event.target.value as RequestStatus)}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-amber-400"
                >
                  {(Object.keys(requestStatusLabel) as RequestStatus[]).map((status) => (
                    <option key={status} value={status}>{requestStatusLabel[status][lang]}</option>
                  ))}
                </select>
                <a
                  href={getWhatsAppUrl(listings.find((item) => item.id === selectedRequest.listingId) ?? listings[0], selectedRequest.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white"
                >
                  <FiMessageCircle />
                  {t.openWhatsapp}
                </a>
                {selectedRequest.files.length ? (
                  <div className="grid gap-2">
                    {selectedRequest.files.map((file) => (
                      <a key={file.id} href={file.url} download={file.name} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
                        <FiDownload />
                        {file.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm font-black text-slate-500">
                    {t.emptyState}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        ) : null}

        {dashboardView === "users" ? (
          <Panel title={t.users} icon={FiUsers}>
            <div className="grid gap-3 md:grid-cols-2">
              {users.map((user) => (
                <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <strong className="block text-lg font-black text-slate-950">{user.name}</strong>
                  <span className="mt-1 block text-sm font-bold text-slate-500">{user.email}</span>
                  <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{user.role}</span>
                </div>
              ))}
            </div>
          </Panel>
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
                onClick={() => {
                  deleteListing(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="h-12 rounded-full bg-rose-600 text-sm font-black text-white"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ListingForm({
  title,
  submitLabel,
  initial = listingToDraft(),
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initial?: ListingDraft;
  onSubmit: (draft: ListingDraft) => void;
}) {
  const { lang, t } = useApp();
  const [draft, setDraft] = useState<ListingDraft>(initial);

  const patchDraft = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(draft);
  };

  const uploadThumbnail = async (event: ChangeEvent<HTMLInputElement>) => {
    const [image] = await readImages(event.target.files);
    if (image) patchDraft("thumbnail", image);
  };

  const uploadGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const images = await readImages(event.target.files);
    patchDraft("gallery", images);
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Panel title={title} icon={FiEdit3} action={<Button type="submit" icon={FiSave}>{submitLabel}</Button>}>
        <div className="grid gap-6">
          <div className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="grid content-start gap-4">
              <FileInput label={t.thumbnail} button={t.chooseImage} onChange={uploadThumbnail} />
              <FileInput label={t.galleryImages} button={t.chooseImages} onChange={uploadGallery} multiple />
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
              <LazyImage src={draft.thumbnail || draft.gallery[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=84"} alt="" className="aspect-[1.85] w-full rounded-3xl object-cover" />
              <div className="grid grid-cols-3 gap-2">
                {[draft.thumbnail, ...draft.gallery].filter(Boolean).slice(0, 6).map((image) => (
                  <LazyImage key={image} src={image} alt="" className="aspect-square rounded-2xl object-cover" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label={t.titleAr} value={draft.titleAr} onChange={(value) => patchDraft("titleAr", value)} required />
            <Field label={t.titleEn} value={draft.titleEn} onChange={(value) => patchDraft("titleEn", value)} />
            <Select label={t.category} value={draft.category} onChange={(value) => patchDraft("category", value as ListingCategory)}>
              {(Object.keys(categoryLabel) as ListingCategory[]).map((category) => (
                <option key={category} value={category}>{categoryLabel[category][lang]}</option>
              ))}
            </Select>
            <Select label={t.status} value={draft.status} onChange={(value) => patchDraft("status", value as ListingStatus)}>
              {(Object.keys(statusLabel) as ListingStatus[]).map((status) => (
                <option key={status} value={status}>{statusLabel[status][lang]}</option>
              ))}
            </Select>
            <Field label={t.summaryAr} value={draft.summaryAr} onChange={(value) => patchDraft("summaryAr", value)} />
            <Field label={t.summaryEn} value={draft.summaryEn} onChange={(value) => patchDraft("summaryEn", value)} />
            <Field label={t.cityAr} value={draft.cityAr} onChange={(value) => patchDraft("cityAr", value)} />
            <Field label={t.cityEn} value={draft.cityEn} onChange={(value) => patchDraft("cityEn", value)} />
            <Field label={t.locationAr} value={draft.locationAr} onChange={(value) => patchDraft("locationAr", value)} />
            <Field label={t.locationEn} value={draft.locationEn} onChange={(value) => patchDraft("locationEn", value)} />
            <Field label={t.valueAr} value={draft.priceLabelAr} onChange={(value) => patchDraft("priceLabelAr", value)} />
            <Field label={t.valueEn} value={draft.priceLabelEn} onChange={(value) => patchDraft("priceLabelEn", value)} />
            <Field label={t.measure} value={draft.measureLabel} onChange={(value) => patchDraft("measureLabel", value)} />
            <label className="flex min-h-12 items-center gap-2 self-end rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700">
              <input type="checkbox" checked={draft.featured} onChange={(event) => patchDraft("featured", event.target.checked)} />
              {t.featured}
            </label>
          </div>

          <div className="grid gap-5">
            <RichTextEditor label={t.descriptionAr} value={draft.descriptionAr} onChange={(value) => patchDraft("descriptionAr", value)} placeholder={t.descriptionAr} />
            <RichTextEditor label={t.descriptionEn} value={draft.descriptionEn} onChange={(value) => patchDraft("descriptionEn", value)} placeholder={t.descriptionEn} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label={`${t.seoTitle} AR`} value={draft.seoTitleAr} onChange={(value) => patchDraft("seoTitleAr", value)} />
            <Field label={`${t.seoTitle} EN`} value={draft.seoTitleEn} onChange={(value) => patchDraft("seoTitleEn", value)} />
            <Field label={`${t.seoDescription} AR`} value={draft.seoDescriptionAr} onChange={(value) => patchDraft("seoDescriptionAr", value)} />
            <Field label={`${t.seoDescription} EN`} value={draft.seoDescriptionEn} onChange={(value) => patchDraft("seoDescriptionEn", value)} />
          </div>
        </div>
      </Panel>
    </form>
  );
}

function Panel({ title, icon: Icon, children, action }: { title: string; icon: IconType; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 animate-fade-up">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-800">
            <Icon />
          </span>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: IconType; label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-amber-300">
        <Icon />
      </span>
      <strong className="mt-5 block text-3xl font-black text-slate-950">{value.toLocaleString()}</strong>
      <span className="mt-1 block text-xs font-black text-slate-500">{label}</span>
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

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-amber-400 focus:bg-white" />
    </label>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-amber-400 focus:bg-white">
        {children}
      </select>
    </label>
  );
}

function FileInput({ label, button, multiple, onChange }: { label: string; button: string; multiple?: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="grid cursor-pointer gap-2 text-sm font-black text-slate-700">
      {label}
      <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-600 transition hover:border-amber-400 hover:bg-amber-50">
        <FiUploadCloud />
        {button}
      </span>
      <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="sr-only" />
    </label>
  );
}
