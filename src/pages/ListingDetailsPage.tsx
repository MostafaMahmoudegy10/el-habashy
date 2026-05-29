import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiHeart, FiMapPin, FiUploadCloud, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { categoryLabel, customerTypeLabel, statusLabel } from "../lib/i18n";
import { RichContent } from "../components/RichContent";
import { ListingCard } from "../components/ListingCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useApp } from "../context/AppContext";
import type { CustomerType, UploadedFile } from "../types";

const emptyRequest = {
  fullName: "",
  whatsapp: "",
  email: "",
  customerType: "individual" as CustomerType,
  notes: "",
  files: [] as UploadedFile[],
};

export function ListingDetailsPage() {
  const {
    lang,
    t,
    listings,
    selectedListing,
    currentUser,
    toggleFavorite,
    submitBookletRequest,
  } = useApp();
  const [imageIndex, setImageIndex] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  const [request, setRequest] = useState(emptyRequest);
  const [error, setError] = useState("");
  const favorite = Boolean(currentUser?.favorites.includes(selectedListing.id));
  const related = useMemo(
    () =>
      listings
        .filter((listing) => listing.id !== selectedListing.id && listing.category === selectedListing.category)
        .slice(0, 3),
    [listings, selectedListing],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!request.fullName || !request.whatsapp || !request.email) {
      setError(t.formRequired);
      return;
    }
    submitBookletRequest(selectedListing.id, request);
    setRequest(emptyRequest);
    setError("");
    setRequestOpen(false);
  };

  const uploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const uploaded = await Promise.all(
      files.map(
        (file, index) =>
          new Promise<UploadedFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ id: Date.now() + index, name: file.name, url: String(reader.result) });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    setRequest((current) => ({ ...current, files: uploaded }));
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="grid gap-3">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
            <img
              src={selectedListing.images[imageIndex] ?? selectedListing.images[0]}
              alt={selectedListing.title[lang]}
              className="aspect-[1.35] w-full rounded-[1.5rem] object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {selectedListing.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setImageIndex(index)}
                className={`overflow-hidden rounded-2xl border transition ${
                  imageIndex === index ? "border-amber-400 ring-4 ring-amber-100" : "border-slate-200"
                }`}
              >
                <img src={image} alt="" className="aspect-[1.35] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              {categoryLabel[selectedListing.category][lang]}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
              {statusLabel[selectedListing.status][lang]}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
            {selectedListing.title[lang]}
          </h1>
          <p className="mt-4 text-sm font-semibold leading-8 text-slate-600">{selectedListing.summary[lang]}</p>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-500">
            <FiMapPin className="text-amber-600" />
            {selectedListing.location[lang]}
          </div>
          <strong className="mt-5 block text-2xl font-black text-slate-950">{selectedListing.priceLabel[lang]}</strong>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <InfoPill label={t.gallery} value={selectedListing.images.length} />
            <InfoPill label={t.bookletRequests} value={selectedListing.bookletRequests} />
            <InfoPill label={t.whatsappClicks} value={selectedListing.whatsappClicks} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-800"
            >
              <FiFileText />
              {t.requestBooklet}
            </button>
            <WhatsAppButton listing={selectedListing} compact />
            <button
              type="button"
              onClick={() => toggleFavorite(selectedListing.id)}
              className={`grid h-12 w-full place-items-center rounded-full border px-5 sm:w-12 ${
                favorite ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={t.addFavorite}
            >
              <FiHeart fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
          <h2 className="text-2xl font-black text-slate-950">{t.description}</h2>
          <div className="mt-5">
            <RichContent value={selectedListing.description[lang]} />
          </div>
        </article>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
          <h2 className="text-2xl font-black text-slate-950">{t.specifications}</h2>
          <div className="mt-5 grid gap-3">
            {selectedListing.specs.map((spec) => (
              <div key={`${spec.label.en}-${spec.value.en}`} className="rounded-2xl bg-slate-50 p-4">
                <span className="text-xs font-black text-slate-500">{spec.label[lang]}</span>
                <strong className="mt-1 block text-sm font-black text-slate-950">{spec.value[lang]}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {related.length ? (
        <section>
          <h2 className="mb-5 text-2xl font-black text-slate-950">{t.relatedListings}</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ) : null}

      {requestOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/65 p-3 backdrop-blur-sm md:place-items-center">
          <form onSubmit={submit} className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-white p-5 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase text-amber-700">{t.requestBooklet}</span>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{selectedListing.title[lang]}</h2>
              </div>
              <button type="button" onClick={() => setRequestOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-600">
                <FiX />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label={t.fullName} value={request.fullName} onChange={(value) => setRequest((current) => ({ ...current, fullName: value }))} />
              <Field label={t.whatsapp} value={request.whatsapp} onChange={(value) => setRequest((current) => ({ ...current, whatsapp: value }))} />
              <Field label={t.email} value={request.email} onChange={(value) => setRequest((current) => ({ ...current, email: value }))} type="email" />
              <label className="grid gap-2 text-sm font-black text-slate-700">
                {t.customerType}
                <select
                  value={request.customerType}
                  onChange={(event) => setRequest((current) => ({ ...current, customerType: event.target.value as CustomerType }))}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-amber-400"
                >
                  {(["individual", "company"] as CustomerType[]).map((type) => (
                    <option key={type} value={type}>{customerTypeLabel[type][lang]}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                {t.notes}
                <textarea
                  value={request.notes}
                  onChange={(event) => setRequest((current) => ({ ...current, notes: event.target.value }))}
                  className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400"
                />
              </label>
              <label className="grid cursor-pointer gap-2 text-sm font-black text-slate-700 md:col-span-2">
                {t.requiredFiles}
                <span className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-amber-400 hover:bg-amber-50">
                  <FiUploadCloud />
                  {request.files.length ? `${request.files.length} ${t.uploadFiles}` : t.uploadFiles}
                </span>
                <input type="file" multiple onChange={uploadFiles} className="sr-only" />
              </label>
            </div>

            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-black text-rose-700">{error}</p> : null}

            <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white">
              <FiDownload />
              {t.requestBooklet}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <strong className="block text-xl font-black text-slate-950">{value}</strong>
      <span className="mt-1 block text-xs font-black text-slate-500">{label}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-amber-400"
      />
    </label>
  );
}
