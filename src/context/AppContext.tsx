import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  initialAboutContent,
  initialListings,
  initialSectors,
  initialSettings,
  initialSubscribers,
} from "../data/properties";
import { useAuth } from "./AuthContext";
import { copy } from "../lib/i18n";
import { initialServices } from "../data/services";
import { sanitizeRichText } from "../lib/richText";
import type {
  AboutContent,
  AboutSection,
  AppSettings,
  Certificate,
  DashboardView,
  Language,
  Listing,
  ListingCategory,
  ListingDraft,
  ListingStatus,
  LocalizedText,
  Page,
  Sector,
  WorkCategory,
  ServiceArticle,
  ServiceDraft,
} from "../types";

type AppContextValue = {
  lang: Language;
  page: Page;
  aboutSection: AboutSection;
  dashboardView: DashboardView;
  mobileOpen: boolean;
  listings: Listing[];
  subscribers: typeof initialSubscribers;
  settings: AppSettings;
  aboutContent: AboutContent;
  sectors: Sector[];
  services: ServiceArticle[];
  selectedService: ServiceArticle;
  selectedListing: Listing;
  listingCategoryFilter: ListingCategory | "all";
  currentUser: ReturnType<typeof useAuth>["user"];
  toast: string;
  t: (typeof copy)[Language];
  setLang: (lang: Language) => void;
  navigate: (page: Page) => void;
  navigateListings: (category?: ListingCategory | "all") => void;
  navigateAbout: (section: AboutSection) => void;
  setListingCategoryFilter: (category: ListingCategory | "all") => void;
  setAboutSection: (section: AboutSection) => void;
  setDashboardView: (view: DashboardView) => void;
  setMobileOpen: (value: boolean) => void;
  selectListing: (id: number) => void;
  getWhatsAppUrl: (listing: Listing, phone?: string) => string;
  trackWhatsApp: (id: number) => void;
  toggleFavorite: (id: number) => void;
  addListing: (draft: ListingDraft) => void;
  updateListing: (id: number, draft: ListingDraft) => void;
  deleteListing: (id: number) => void;
  updateListingStatus: (id: number, status: ListingStatus) => void;
  updateSettings: (settings: AppSettings) => void;
  updateSector: (id: ListingCategory, sector: Omit<Sector, "id">) => void;
  addWorkCategory: (category: Omit<WorkCategory, "id">) => void;
  updateWorkCategory: (id: number, category: Omit<WorkCategory, "id">) => void;
  deleteWorkCategory: (id: number) => void;
  updateAboutContent: (content: AboutContent) => void;
  addCertificate: (certificate: Omit<Certificate, "id">) => void;
  updateCertificate: (id: number, certificate: Omit<Certificate, "id">) => void;
  deleteCertificate: (id: number) => void;
  updateStructure: (structure: AboutContent["structure"]) => void;
  selectService: (id: number) => void;
  addService: (draft: ServiceDraft) => void;
  updateService: (id: number, draft: ServiceDraft) => void;
  deleteService: (id: number) => void;
  setToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=84";
const storageKeys = {
  listings: "elhabashy:listings",
  settings: "elhabashy:settings",
  aboutContent: "elhabashy:about-content",
  sectors: "elhabashy:sectors",
  services: "elhabashy:services",
};

const categoryIds: ListingCategory[] = ["real-estate", "movables", "cars", "antiques", "scrap", "other"];

function serviceFromDraft(draft: ServiceDraft, id: number, current?: ServiceArticle): ServiceArticle {
  return {
    id,
    kind: draft.kind,
    title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr, fr: draft.titleEn || draft.titleAr },
    summary: { ar: draft.summaryAr, en: draft.summaryEn || draft.summaryAr, fr: draft.summaryEn || draft.summaryAr },
    content: {
      ar: sanitizeRichText(draft.contentAr),
      en: sanitizeRichText(draft.contentEn || draft.contentAr),
      fr: sanitizeRichText(draft.contentEn || draft.contentAr),
    },
    image: draft.image || current?.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85",
    gallery: draft.gallery || current?.gallery || [],
    featured: draft.featured,
    createdAt: current?.createdAt || new Date().toISOString().slice(0, 10),
  };
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value?: Partial<LocalizedText>): LocalizedText {
  const ar = value?.ar ?? "";
  const en = value?.en || ar;
  const fr = value?.fr || en || ar;
  return { ar, en, fr };
}

function normalizeService(service: ServiceArticle): ServiceArticle {
  const seed = initialServices.find((item) => item.id === service.id);
  return {
    ...service,
    title: normalizeText(service.title),
    summary: normalizeText(service.summary),
    content: normalizeText(service.content),
    gallery: Array.isArray(service.gallery) && service.gallery.filter(Boolean).length ? service.gallery.filter(Boolean) : seed?.gallery ?? [],
    image: service.image || seed?.image || fallbackImage,
  };
}

function normalizeCategory(value: string): ListingCategory {
  return categoryIds.includes(value as ListingCategory) ? (value as ListingCategory) : "other";
}

function normalizeListing(listing: Listing): Listing {
  const seed = initialListings.find((item) => item.id === listing.id);
  return {
    ...listing,
    category: normalizeCategory(String((listing as { category?: string }).category ?? "other")),
    title: normalizeText(listing.title),
    summary: normalizeText(listing.summary),
    description: normalizeText(listing.description),
    city: normalizeText(listing.city),
    location: normalizeText(listing.location),
    priceLabel: normalizeText(listing.priceLabel),
    specs: listing.specs.map((spec) => ({
      label: normalizeText(spec.label),
      value: normalizeText(spec.value),
    })),
    publishDate: listing.publishDate || seed?.publishDate,
    expireDate: listing.expireDate || seed?.expireDate,
    auctionDate: listing.auctionDate || seed?.auctionDate,
    auctionTime: listing.auctionTime || seed?.auctionTime,
    beneficiary: listing.beneficiary ? normalizeText(listing.beneficiary) : seed?.beneficiary ? normalizeText(seed.beneficiary) : undefined,
    venue: listing.venue ? normalizeText(listing.venue) : seed?.venue ? normalizeText(seed.venue) : undefined,
    announcementSource: listing.announcementSource ? normalizeText(listing.announcementSource) : seed?.announcementSource ? normalizeText(seed.announcementSource) : undefined,
    notes: listing.notes ? normalizeText(listing.notes) : seed?.notes ? normalizeText(seed.notes) : undefined,
    mapUrl: listing.mapUrl || seed?.mapUrl || "",
    whatsappClicks: listing.whatsappClicks ?? 0,
    seoTitle: listing.seoTitle ? normalizeText(listing.seoTitle) : undefined,
    seoDescription: listing.seoDescription ? normalizeText(listing.seoDescription) : undefined,
    seoKeywords: listing.seoKeywords ? normalizeText(listing.seoKeywords) : undefined,
  };
}

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  return {
    ...initialSettings,
    ...settings,
    whatsappMessageFr: settings.whatsappMessageFr || settings.whatsappMessageEn || initialSettings.whatsappMessageFr,
    officeAddress: normalizeText(settings.officeAddress ?? initialSettings.officeAddress),
    mapUrl: settings.mapUrl ?? initialSettings.mapUrl,
    facebookUrl: settings.facebookUrl || initialSettings.facebookUrl,
    linkedinUrl: settings.linkedinUrl || initialSettings.linkedinUrl,
  };
}

function normalizeAboutContent(content: AboutContent): AboutContent {
  const storedWork = Array.isArray(content.workCategories) ? content.workCategories : [];
  const storedCertificates = Array.isArray(content.certificates) ? content.certificates : [];
  const workCategories = [...storedWork, ...initialAboutContent.workCategories.filter((seed) => !storedWork.some((item) => item.id === seed.id))];
  const certificates = [...storedCertificates, ...initialAboutContent.certificates.filter((seed) => !storedCertificates.some((item) => item.id === seed.id))];
  return {
    ...content,
    profile: normalizeText(content.profile ?? initialAboutContent.profile),
    profileImage: content.profileImage || initialAboutContent.profileImage,
    workCategories: workCategories.map((category) => ({
      ...category,
      title: normalizeText(category.title),
      items: category.items.map((item) => normalizeText(item)),
    })),
    certificates: certificates.map((certificate) => {
      const seed = initialAboutContent.certificates.find((item) => item.id === certificate.id);
      return ({
      ...certificate,
      title: normalizeText(certificate.title),
      description: normalizeText(certificate.description),
      image: certificate.image || seed?.image,
    }); }),
    structure: {
      ...(content.structure ?? initialAboutContent.structure),
      image: content.structure?.image || initialAboutContent.structure.image,
      leaders: (content.structure?.leaders?.length ? content.structure.leaders : initialAboutContent.structure.leaders).map((item) => normalizeText(item)),
      departments: (content.structure?.departments?.length ? content.structure.departments : initialAboutContent.structure.departments).map((item) => normalizeText(item)),
    },
  };
}

function normalizeSector(sector: Sector): Sector {
  return {
    ...sector,
    title: normalizeText(sector.title),
    description: normalizeText(sector.description),
  };
}

function normalizeSectors(sectors: Sector[]): Sector[] {
  const storedById = new Map(
    sectors
      .filter((sector) => categoryIds.includes((sector as { id?: string }).id as ListingCategory))
      .map((sector) => [sector.id, normalizeSector(sector)]),
  );
  return initialSectors.map((sector) => storedById.get(sector.id) ?? normalizeSector(sector));
}

function draftToListing(draft: ListingDraft, id: number, current?: Listing): Listing {
  const images = [draft.thumbnail, ...draft.gallery].filter(Boolean);
  return {
    id,
    slug: slugify(draft.seoSlug || draft.titleEn || draft.titleAr || current?.slug || `listing-${id}`),
    title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr, fr: draft.titleFr || draft.titleEn || draft.titleAr },
    summary: { ar: draft.summaryAr, en: draft.summaryEn || draft.summaryAr, fr: draft.summaryFr || draft.summaryEn || draft.summaryAr },
    description: {
      ar: sanitizeRichText(draft.descriptionAr),
      en: sanitizeRichText(draft.descriptionEn || draft.descriptionAr),
      fr: sanitizeRichText(draft.descriptionFr || draft.descriptionEn || draft.descriptionAr),
    },
    category: draft.category,
    status: draft.status,
    city: { ar: draft.cityAr, en: draft.cityEn || draft.cityAr, fr: draft.cityFr || draft.cityEn || draft.cityAr },
    location: { ar: draft.locationAr, en: draft.locationEn || draft.locationAr, fr: draft.locationFr || draft.locationEn || draft.locationAr },
    priceLabel: { ar: draft.priceLabelAr, en: draft.priceLabelEn || draft.priceLabelAr, fr: draft.priceLabelFr || draft.priceLabelEn || draft.priceLabelAr },
    measureLabel: draft.measureLabel,
    featured: draft.featured,
    images: images.length ? images : current?.images ?? [fallbackImage],
    specs: current?.specs ?? [
      { label: { ar: "القسم", en: "Category", fr: "Categorie" }, value: { ar: draft.category, en: draft.category, fr: draft.category } },
      {
        label: { ar: "الموقع", en: "Location", fr: "Emplacement" },
        value: { ar: draft.locationAr, en: draft.locationEn || draft.locationAr, fr: draft.locationFr || draft.locationEn || draft.locationAr },
      },
      { label: { ar: "الكمية", en: "Quantity", fr: "Quantite" }, value: { ar: draft.measureLabel, en: draft.measureLabel, fr: draft.measureLabel } },
    ],
    createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10),
    publishDate: draft.publishDate,
    expireDate: draft.expireDate,
    auctionDate: draft.auctionDate,
    auctionTime: draft.auctionTime,
    beneficiary: { ar: draft.beneficiaryAr, en: draft.beneficiaryEn || draft.beneficiaryAr, fr: draft.beneficiaryFr || draft.beneficiaryEn || draft.beneficiaryAr },
    venue: { ar: draft.venueAr, en: draft.venueEn || draft.venueAr, fr: draft.venueFr || draft.venueEn || draft.venueAr },
    announcementSource: {
      ar: draft.announcementSourceAr,
      en: draft.announcementSourceEn || draft.announcementSourceAr,
      fr: draft.announcementSourceFr || draft.announcementSourceEn || draft.announcementSourceAr,
    },
    notes: { ar: draft.notesAr, en: draft.notesEn || draft.notesAr, fr: draft.notesFr || draft.notesEn || draft.notesAr },
    mapUrl: draft.mapUrl,
    whatsappPhone: draft.whatsappPhone,
    views: current?.views ?? 0,
    whatsappClicks: current?.whatsappClicks ?? 0,
    seoTitle: { ar: draft.seoTitleAr, en: draft.seoTitleEn, fr: draft.seoTitleFr || draft.seoTitleEn },
    seoDescription: { ar: draft.seoDescriptionAr, en: draft.seoDescriptionEn, fr: draft.seoDescriptionFr || draft.seoDescriptionEn },
    seoKeywords: { ar: draft.seoKeywordsAr, en: draft.seoKeywordsEn, fr: draft.seoKeywordsFr || draft.seoKeywordsEn },
  };
}

export function listingToDraft(listing?: Listing): ListingDraft {
  return {
    titleAr: listing?.title.ar ?? "",
    titleEn: listing?.title.en ?? "",
    titleFr: listing?.title.fr ?? "",
    category: listing?.category ?? "real-estate",
    status: listing?.status ?? "active",
    thumbnail: listing?.images[0] ?? "",
    gallery: listing?.images.slice(1) ?? [],
    descriptionAr: listing?.description.ar ?? "",
    descriptionEn: listing?.description.en ?? "",
    descriptionFr: listing?.description.fr ?? "",
    summaryAr: listing?.summary.ar ?? "",
    summaryEn: listing?.summary.en ?? "",
    summaryFr: listing?.summary.fr ?? "",
    locationAr: listing?.location.ar ?? "",
    locationEn: listing?.location.en ?? "",
    locationFr: listing?.location.fr ?? "",
    cityAr: listing?.city.ar ?? "",
    cityEn: listing?.city.en ?? "",
    cityFr: listing?.city.fr ?? "",
    priceLabelAr: listing?.priceLabel.ar ?? "",
    priceLabelEn: listing?.priceLabel.en ?? "",
    priceLabelFr: listing?.priceLabel.fr ?? "",
    measureLabel: listing?.measureLabel ?? "",
    publishDate: listing?.publishDate ?? "",
    expireDate: listing?.expireDate ?? "",
    auctionDate: listing?.auctionDate ?? "",
    auctionTime: listing?.auctionTime ?? "",
    beneficiaryAr: listing?.beneficiary?.ar ?? "",
    beneficiaryEn: listing?.beneficiary?.en ?? "",
    beneficiaryFr: listing?.beneficiary?.fr ?? "",
    venueAr: listing?.venue?.ar ?? "",
    venueEn: listing?.venue?.en ?? "",
    venueFr: listing?.venue?.fr ?? "",
    announcementSourceAr: listing?.announcementSource?.ar ?? "",
    announcementSourceEn: listing?.announcementSource?.en ?? "",
    announcementSourceFr: listing?.announcementSource?.fr ?? "",
    notesAr: listing?.notes?.ar ?? "",
    notesEn: listing?.notes?.en ?? "",
    notesFr: listing?.notes?.fr ?? "",
    mapUrl: listing?.mapUrl ?? "",
    whatsappPhone: listing?.whatsappPhone ?? "",
    seoTitleAr: listing?.seoTitle?.ar ?? "",
    seoTitleEn: listing?.seoTitle?.en ?? "",
    seoTitleFr: listing?.seoTitle?.fr ?? "",
    seoDescriptionAr: listing?.seoDescription?.ar ?? "",
    seoDescriptionEn: listing?.seoDescription?.en ?? "",
    seoDescriptionFr: listing?.seoDescription?.fr ?? "",
    seoKeywordsAr: listing?.seoKeywords?.ar ?? "",
    seoKeywordsEn: listing?.seoKeywords?.en ?? "",
    seoKeywordsFr: listing?.seoKeywords?.fr ?? "",
    seoSlug: listing?.slug ?? "",
    featured: listing?.featured ?? false,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const { user: currentUser } = useAuth();
  const [lang, setLang] = useState<Language>("ar");
  const [page, setPage] = useState<Page>("home");
  const [aboutSection, setAboutSection] = useState<AboutSection>("profile");
  const [dashboardView, setDashboardView] = useState<DashboardView>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>(() =>
    readStored<Listing[]>(storageKeys.listings, initialListings).map(normalizeListing),
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    normalizeSettings(readStored<Partial<AppSettings>>(storageKeys.settings, initialSettings)),
  );
  const [aboutContent, setAboutContent] = useState<AboutContent>(() =>
    normalizeAboutContent(readStored(storageKeys.aboutContent, initialAboutContent)),
  );
  const [sectors, setSectors] = useState<Sector[]>(() =>
    normalizeSectors(readStored(storageKeys.sectors, initialSectors)),
  );
  const [services, setServices] = useState<ServiceArticle[]>(() => {
    const stored = readStored<ServiceArticle[]>(storageKeys.services, []);
    return [...stored, ...initialServices.filter((seed) => !stored.some((item) => item.id === seed.id))].map(normalizeService);
  });
  const [selectedServiceId, setSelectedServiceId] = useState(initialServices[0].id);
  const [selectedListingId, setSelectedListingId] = useState(initialListings[0].id);
  const [listingCategoryFilter, setListingCategoryFilter] = useState<ListingCategory | "all">("all");
  const [toast, setToast] = useState("");

  const t = copy[lang];
  const selectedListing = listings.find((listing) => listing.id === selectedListingId) ?? listings[0];
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.listings, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.settings, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.aboutContent, JSON.stringify(aboutContent));
  }, [aboutContent]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.sectors, JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.services, JSON.stringify(services));
  }, [services]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      page,
      aboutSection,
      dashboardView,
      mobileOpen,
      listings,
      subscribers: initialSubscribers,
      settings,
      aboutContent,
      sectors,
      services,
      selectedService,
      selectedListing,
      listingCategoryFilter,
      currentUser,
      toast,
      t,
      setLang,
      navigate(nextPage) {
        setPage(nextPage);
        setMobileOpen(false);
      },
      navigateListings(category = "all") {
        setListingCategoryFilter(category);
        setPage("listings");
        setMobileOpen(false);
      },
      navigateAbout(section) {
        setAboutSection(section);
        setPage("about");
        setMobileOpen(false);
      },
      setListingCategoryFilter,
      setAboutSection,
      setDashboardView(view) {
        setDashboardView(view);
        setPage("dashboard");
        setMobileOpen(false);
      },
      setMobileOpen,
      selectListing(id) {
        setSelectedListingId(id);
        setListings((current) =>
          current.map((listing) => (listing.id === id ? { ...listing, views: listing.views + 1 } : listing)),
        );
        setPage("details");
        setMobileOpen(false);
      },
      getWhatsAppUrl(listing, phone = settings.whatsappNumber) {
        const targetPhone = listing.whatsappPhone || phone || settings.whatsappNumber;
        const title = listing.title[lang] || listing.title.ar || listing.title.en;
        const sectorTitle = sectors.find((sector) => sector.id === listing.category)?.title[lang] || listing.category;
        const template =
          lang === "ar"
            ? settings.whatsappMessageAr
            : lang === "fr"
              ? settings.whatsappMessageFr
              : settings.whatsappMessageEn;
        const routedMessage = (template || "{title}")
          .replace(/\{title\}/g, title)
          .replace(/\{category\}/g, sectorTitle)
          .replace(/\{id\}/g, String(listing.id));
        return `https://wa.me/${targetPhone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(routedMessage)}`;
      },
      trackWhatsApp(id) {
        setListings((current) =>
          current.map((listing) =>
            listing.id === id ? { ...listing, whatsappClicks: listing.whatsappClicks + 1 } : listing,
          ),
        );
      },
      toggleFavorite(id) {
        if (!currentUser) {
          setToast(t.favoriteLoginRequired);
          setPage("login");
          return;
        }
        setToast(lang === "ar" ? "سيتم توفير المفضلة قريبًا." : "Favorites will be available soon.");
      },
      addListing(draft) {
        const nextId = Math.max(0, ...listings.map((listing) => listing.id)) + 1;
        const nextListing = draftToListing(draft, nextId);
        setListings((current) => [nextListing, ...current]);
        setSelectedListingId(nextId);
        setToast(t.success);
      },
      updateListing(id, draft) {
        setListings((current) =>
          current.map((listing) => (listing.id === id ? draftToListing(draft, id, listing) : listing)),
        );
        setToast(t.success);
      },
      deleteListing(id) {
        setListings((current) => current.filter((listing) => listing.id !== id));
        setToast(t.success);
      },
      updateListingStatus(id, status) {
        setListings((current) => current.map((listing) => (listing.id === id ? { ...listing, status } : listing)));
      },
      updateSettings(nextSettings) {
        setSettings(normalizeSettings(nextSettings));
        setToast(t.settingsSaved);
      },
      updateSector(id, sector) {
        setSectors((current) =>
          normalizeSectors(current.map((item) => (item.id === id ? { id, ...sector } : item))),
        );
        setToast(t.success);
      },
      addWorkCategory(category) {
        const nextId = Math.max(0, ...aboutContent.workCategories.map((item) => item.id)) + 1;
        setAboutContent((current) => ({
          ...current,
          workCategories: [...current.workCategories, { id: nextId, ...category }],
        }));
        setToast(t.success);
      },
      updateWorkCategory(id, category) {
        setAboutContent((current) => ({
          ...current,
          workCategories: current.workCategories.map((item) => (item.id === id ? { id, ...category } : item)),
        }));
        setToast(t.success);
      },
      deleteWorkCategory(id) {
        setAboutContent((current) => ({
          ...current,
          workCategories: current.workCategories.filter((item) => item.id !== id),
        }));
        setToast(t.success);
      },
      addCertificate(certificate) {
        const nextId = Math.max(0, ...aboutContent.certificates.map((item) => item.id)) + 1;
        setAboutContent((current) =>
          normalizeAboutContent({
            ...current,
            certificates: [...current.certificates, { id: nextId, ...certificate }],
          }),
        );
        setToast(t.success);
      },
      updateCertificate(id, certificate) {
        setAboutContent((current) =>
          normalizeAboutContent({
            ...current,
            certificates: current.certificates.map((item) => (item.id === id ? { id, ...certificate } : item)),
          }),
        );
        setToast(t.success);
      },
      deleteCertificate(id) {
        setAboutContent((current) => ({
          ...current,
          certificates: current.certificates.filter((item) => item.id !== id),
        }));
        setToast(t.success);
      },
      updateStructure(structure) {
        setAboutContent((current) => normalizeAboutContent({ ...current, structure }));
        setToast(t.success);
      },
      updateAboutContent(content) {
        setAboutContent(normalizeAboutContent(content));
        setToast(t.success);
      },
      selectService(id) {
        setSelectedServiceId(id);
        setPage("service-details");
        setMobileOpen(false);
      },
      addService(draft) {
        const id = Math.max(0, ...services.map((item) => item.id)) + 1;
        setServices((current) => [serviceFromDraft(draft, id), ...current]);
        setToast(t.success);
      },
      updateService(id, draft) {
        setServices((current) => current.map((item) => item.id === id ? serviceFromDraft(draft, id, item) : item));
        setToast(t.success);
      },
      deleteService(id) {
        setServices((current) => current.filter((item) => item.id !== id));
        setToast(t.success);
      },
      setToast,
    }),
    [
      currentUser,
      aboutContent,
      aboutSection,
      dashboardView,
      lang,
      listingCategoryFilter,
      listings,
      mobileOpen,
      page,
      selectedListing,
      settings,
      sectors,
      services,
      selectedService,
      t,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
