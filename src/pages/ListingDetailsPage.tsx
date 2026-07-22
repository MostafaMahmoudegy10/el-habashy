import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { FiCalendar, FiClock, FiExternalLink, FiHeart, FiInfo, FiMapPin, FiUserCheck } from "react-icons/fi";
import { statusLabel } from "../lib/i18n";
import { getSectorTitle } from "../lib/sectors";
import { LazyImage } from "../components/LazyImage";
import { RichContent } from "../components/RichContent";
import { ListingCard } from "../components/ListingCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useApp } from "../context/AppContext";

export function ListingDetailsPage() {
  const { lang, t, listings, sectors, selectedListing, settings, currentUser, toggleFavorite } = useApp();
  const [imageIndex, setImageIndex] = useState(0);
  const favorite = Boolean(currentUser?.favorites.includes(selectedListing.id));
  const locationUrl = selectedListing.mapUrl || settings.mapUrl;
  const related = useMemo(
    () =>
      listings
        .filter((listing) => listing.id !== selectedListing.id && listing.category === selectedListing.category)
        .slice(0, 3),
    [listings, selectedListing],
  );
  const auctionFacts = [
    { icon: FiCalendar, label: t.auctionPublishDate, value: selectedListing.publishDate },
    { icon: FiCalendar, label: t.auctionExpireDate, value: selectedListing.expireDate },
    { icon: FiClock, label: t.auctionSessionDate, value: [selectedListing.auctionDate, selectedListing.auctionTime].filter(Boolean).join(" - ") },
    { icon: FiUserCheck, label: t.beneficiary, value: selectedListing.beneficiary?.[lang] },
    { icon: FiMapPin, label: t.venue, value: selectedListing.venue?.[lang] },
    { icon: FiInfo, label: t.announcementSource, value: selectedListing.announcementSource?.[lang] },
  ].filter((item) => item.value);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="grid gap-3">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
            <LazyImage
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
                <LazyImage src={image} alt="" className="aspect-[1.35] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              {getSectorTitle(sectors, selectedListing.category, lang)}
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

          {auctionFacts.length ? (
            <div className="mt-6 grid gap-3">
              {auctionFacts.map((item) => (
                <AuctionFact key={item.label} icon={item.icon} label={item.label} value={String(item.value)} />
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <InfoPill label={t.gallery} value={selectedListing.images.length} />
            <InfoPill label={t.totalViews} value={selectedListing.views} />
            <InfoPill label={t.whatsappClicks} value={selectedListing.whatsappClicks} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <WhatsAppButton listing={selectedListing} className="min-h-12 px-6" />
            {locationUrl ? (
              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
              >
                <FiExternalLink />
                {t.openLocation}
              </a>
            ) : null}
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
          {selectedListing.notes?.[lang] ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <span className="text-xs font-black text-amber-700">{t.auctionNotes}</span>
              <p className="mt-2 text-sm font-bold leading-7 text-amber-950">{selectedListing.notes[lang]}</p>
            </div>
          ) : null}
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

function AuctionFact({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
        <Icon />
      </span>
      <span>
        <small className="block text-xs font-black text-slate-500">{label}</small>
        <strong className="mt-1 block text-sm font-black leading-6 text-slate-950">{value}</strong>
      </span>
    </div>
  );
}
