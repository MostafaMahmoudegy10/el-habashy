import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  initialAboutContent,
  initialSettings,
  initialSubscribers,
} from "../data/properties";
import { useAuth } from "./AuthContext";
import { copy } from "../lib/i18n";
import { initialServices } from "../data/services";
import { sanitizeRichText } from "../lib/richText";
import { readPublicContentCache, updatePublicContentCache } from "../lib/publicContentCache";
import {
  elHabashyApi,
  type ListingQuery,
  type ListingResponse,
  type ListingSubmissionMedia,
  type SectorResponse,
  type UpsertListingBody,
  type UpsertServiceArticleBody,
  type UpdateAboutProfileBody,
  type UpsertAboutDepartmentBody,
  type UpsertAboutPersonBody,
  type UpsertCertificateBody,
  type UpsertWorkCategoryBody,
  type UpsertWorkEntryBody,
} from "../lib/elHabashyApi";
import type {
  AboutContent,
  AboutDepartment,
  AboutPerson,
  AboutProfile,
  AboutSection,
  AppSettings,
  Certificate,
  DashboardView,
  Language,
  Listing,
  ListingCategory,
  ListingDraft,
  ListingMedia,
  ListingMediaRole,
  ListingStatus,
  LocalizedText,
  Page,
  Sector,
  WorkCategory,
  WorkEntry,
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
  featuredListings: Listing[];
  listingsLoading: boolean;
  listingsError: string;
  adminListings: Listing[];
  adminListingsLoading: boolean;
  adminListingsError: string;
  subscribers: typeof initialSubscribers;
  settings: AppSettings;
  aboutContent: AboutContent;
  aboutLoading: boolean;
  aboutError: string;
  sectors: Sector[];
  sectorsLoading: boolean;
  sectorsError: string;
  services: ServiceArticle[];
  selectedService: ServiceArticle;
  selectedListing?: Listing;
  listingDetailLoading: boolean;
  listingDetailError: string;
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
  searchListings: (query: ListingQuery) => Promise<Listing[]>;
  toggleFavorite: (id: number) => void;
  reloadContent: () => Promise<void>;
  reloadAdminListings: () => Promise<void>;
  addListing: (draft: ListingDraft, media?: ListingSubmissionMedia) => Promise<Listing>;
  updateListing: (id: number, draft: ListingDraft) => Promise<Listing>;
  deleteListing: (id: number) => Promise<void>;
  updateListingStatus: (id: number, status: ListingStatus) => Promise<Listing>;
  uploadListingMedia: (
    listingId: number,
    file: File,
    role: ListingMediaRole,
    options?: { signal?: AbortSignal; onMedia?: (media: ListingMedia) => void },
  ) => Promise<ListingMedia>;
  watchListingMedia: (
    listingId: number,
    media: ListingMedia,
    options?: { signal?: AbortSignal; onMedia?: (media: ListingMedia) => void },
  ) => Promise<ListingMedia>;
  deleteListingMedia: (listingId: number, mediaId: number) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<AppSettings>;
  updateSector: (id: ListingCategory, sector: Omit<Sector, "id">) => Promise<Sector>;
  reloadAboutContent: () => Promise<void>;
  updateAboutProfile: (profile: UpdateAboutProfileBody) => Promise<AboutProfile>;
  createAboutPerson: (person: UpsertAboutPersonBody) => Promise<AboutPerson>;
  updateAboutPerson: (id: number, person: UpsertAboutPersonBody) => Promise<AboutPerson>;
  deleteAboutPerson: (id: number) => Promise<void>;
  createAboutDepartment: (department: UpsertAboutDepartmentBody) => Promise<AboutDepartment>;
  updateAboutDepartment: (id: number, department: UpsertAboutDepartmentBody) => Promise<AboutDepartment>;
  deleteAboutDepartment: (id: number) => Promise<void>;
  createCertificate: (certificate: UpsertCertificateBody) => Promise<Certificate>;
  updateCertificate: (id: number, certificate: UpsertCertificateBody) => Promise<Certificate>;
  deleteCertificate: (id: number) => Promise<void>;
  createWorkCategory: (category: UpsertWorkCategoryBody) => Promise<WorkCategory>;
  updateWorkCategory: (id: number, category: UpsertWorkCategoryBody) => Promise<WorkCategory>;
  deleteWorkCategory: (id: number) => Promise<void>;
  createWorkEntry: (categoryId: number, entry: UpsertWorkEntryBody) => Promise<WorkEntry>;
  updateWorkEntry: (id: number, entry: UpsertWorkEntryBody) => Promise<WorkEntry>;
  deleteWorkEntry: (id: number) => Promise<void>;
  uploadAboutImage: (file: File) => Promise<string>;
  reloadServices: () => Promise<void>;
  selectService: (id: number) => void;
  addService: (draft: ServiceDraft) => Promise<ServiceArticle>;
  updateService: (id: number, draft: ServiceDraft) => Promise<ServiceArticle>;
  deleteService: (id: number) => Promise<void>;
  uploadServiceImage: (file: File) => Promise<string>;
  setToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=84";
const categoryIds: ListingCategory[] = ["real-estate", "movables", "cars", "antiques", "scrap", "other"];

function serviceDraftToRequest(draft: ServiceDraft): UpsertServiceArticleBody {
  const title = normalizePair(draft.titleAr, draft.titleEn);
  const summary = normalizePair(draft.summaryAr, draft.summaryEn);
  const content = normalizePair(
    sanitizeRichText(draft.contentAr),
    sanitizeRichText(draft.contentEn || draft.contentAr),
  );
  return {
    kind: draft.kind,
    title,
    summary,
    content,
    image: draft.image,
    gallery: draft.gallery,
    featured: draft.featured,
    displayOrder: draft.displayOrder,
    seoTitle: optionalText(draft.seoTitleAr, draft.seoTitleEn),
    seoDescription: optionalText(draft.seoDescriptionAr, draft.seoDescriptionEn),
    seoKeywords: optionalText(draft.seoKeywordsAr, draft.seoKeywordsEn),
  };
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
  return { ar, en };
}

function normalizeService(service: ServiceArticle): ServiceArticle {
  const seed = initialServices.find((item) => item.id === service.id);
  return {
    ...service,
    title: normalizeText(service.title),
    summary: normalizeText(service.summary),
    content: normalizeText(service.content),
    gallery: Array.isArray(service.gallery) ? service.gallery.filter(Boolean) : seed?.gallery ?? [],
    image: service.image || seed?.image || fallbackImage,
    displayOrder: service.displayOrder ?? seed?.displayOrder ?? 0,
    seoTitle: service.seoTitle ? normalizeText(service.seoTitle) : undefined,
    seoDescription: service.seoDescription ? normalizeText(service.seoDescription) : undefined,
    seoKeywords: service.seoKeywords ? normalizeText(service.seoKeywords) : undefined,
  };
}

function normalizeCategory(value: string): ListingCategory {
  return categoryIds.includes(value as ListingCategory) ? (value as ListingCategory) : "other";
}

function normalizeListing(listing: Listing): Listing {
  return {
    ...listing,
    category: normalizeCategory(String((listing as { category?: string }).category ?? "other")),
    title: normalizeText(listing.title),
    summary: normalizeText(listing.summary),
    description: normalizeText(listing.description),
    city: normalizeText(listing.city),
    location: normalizeText(listing.location),
    priceLabel: normalizeText(listing.priceLabel),
    images: Array.isArray(listing.images) && listing.images.length ? listing.images : [fallbackImage],
    media: Array.isArray(listing.media) ? listing.media : [],
    specs: (Array.isArray(listing.specs) ? listing.specs : []).map((spec) => ({
      label: normalizeText(spec.label),
      value: normalizeText(spec.value),
    })),
    beneficiary: listing.beneficiary ? normalizeText(listing.beneficiary) : undefined,
    venue: listing.venue ? normalizeText(listing.venue) : undefined,
    announcementSource: listing.announcementSource ? normalizeText(listing.announcementSource) : undefined,
    notes: listing.notes ? normalizeText(listing.notes) : undefined,
    mapUrl: listing.mapUrl || "",
    whatsappClicks: listing.whatsappClicks ?? 0,
    seoTitle: listing.seoTitle ? normalizeText(listing.seoTitle) : undefined,
    seoDescription: listing.seoDescription ? normalizeText(listing.seoDescription) : undefined,
    seoKeywords: listing.seoKeywords ? normalizeText(listing.seoKeywords) : undefined,
  };
}

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  return {
    whatsappNumber: settings.whatsappNumber ?? initialSettings.whatsappNumber,
    whatsappMessageAr: settings.whatsappMessageAr ?? initialSettings.whatsappMessageAr,
    whatsappMessageEn: settings.whatsappMessageEn ?? initialSettings.whatsappMessageEn,
    contactPhone: settings.contactPhone ?? initialSettings.contactPhone,
    contactEmail: settings.contactEmail ?? initialSettings.contactEmail,
    officeAddress: normalizeText(settings.officeAddress ?? initialSettings.officeAddress),
    mapUrl: settings.mapUrl ?? initialSettings.mapUrl,
    facebookUrl: settings.facebookUrl || initialSettings.facebookUrl,
    linkedinUrl: settings.linkedinUrl || initialSettings.linkedinUrl,
  };
}

function normalizeAboutContent(content: AboutContent): AboutContent {
  return {
    profile: {
      ...initialAboutContent.profile,
      ...content.profile,
      headline: normalizeText(content.profile?.headline ?? initialAboutContent.profile.headline),
      profile: normalizeText(content.profile?.profile ?? initialAboutContent.profile.profile),
      mission: normalizeText(content.profile?.mission ?? initialAboutContent.profile.mission),
      vision: normalizeText(content.profile?.vision ?? initialAboutContent.profile.vision),
      imageUrl: content.profile?.imageUrl || initialAboutContent.profile.imageUrl,
      startedYear: content.profile?.startedYear ?? initialAboutContent.profile.startedYear,
    },
    people: (Array.isArray(content.people) ? content.people : []).map((person) => ({
      ...person,
      name: normalizeText(person.name),
      role: normalizeText(person.role),
      biography: normalizeText(person.biography),
    })),
    departments: (Array.isArray(content.departments) ? content.departments : []).map((department) => ({
      ...department,
      title: normalizeText(department.title),
      description: normalizeText(department.description),
    })),
    workCategories: (Array.isArray(content.workCategories) ? content.workCategories : []).map((category) => ({
      ...category,
      title: normalizeText(category.title),
      summary: normalizeText(category.summary),
      entries: (Array.isArray(category.entries) ? category.entries : []).map((entry) => ({
        ...entry,
        title: normalizeText(entry.title),
        client: normalizeText(entry.client),
        summary: normalizeText(entry.summary),
        details: normalizeText(entry.details),
        location: normalizeText(entry.location),
      })),
    })),
    certificates: (Array.isArray(content.certificates) ? content.certificates : []).map((certificate) => ({
      ...certificate,
      title: normalizeText(certificate.title),
      issuer: normalizeText(certificate.issuer),
      description: normalizeText(certificate.description),
    })),
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
  return sectors
    .filter((sector) => categoryIds.includes((sector as { id?: string }).id as ListingCategory))
    .map(normalizeSector)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

function listingFromResponse(response: ListingResponse): Listing {
  return normalizeListing({
    ...response,
    category: normalizeCategory(response.category),
  });
}

function sectorFromResponse(response: SectorResponse): Sector | null {
  if (!categoryIds.includes(response.code as ListingCategory)) return null;
  return normalizeSector({
    id: response.code as ListingCategory,
    title: response.title,
    description: response.description,
    displayOrder: response.displayOrder,
    updatedAt: response.updatedAt,
  });
}

function optionalText(ar: string, en: string): LocalizedText | undefined {
  const primary = ar.trim() || en.trim();
  if (!primary) return undefined;
  return { ar: ar.trim() || primary, en: en.trim() || primary };
}

function normalizePair(ar: string, en: string): LocalizedText {
  const primary = ar.trim() || en.trim();
  return { ar: ar.trim() || primary, en: en.trim() || primary };
}

function draftToListing(draft: ListingDraft, id: number, current?: Listing): Listing {
  const images = [draft.thumbnail, ...draft.gallery].filter(Boolean);
  return {
    id,
    slug: slugify(draft.seoSlug || draft.titleEn || draft.titleAr || current?.slug || `listing-${id}`),
    title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr },
    summary: { ar: draft.summaryAr, en: draft.summaryEn || draft.summaryAr },
    description: {
      ar: sanitizeRichText(draft.descriptionAr),
      en: sanitizeRichText(draft.descriptionEn || draft.descriptionAr),
    },
    category: draft.category,
    status: draft.status,
    city: { ar: draft.cityAr, en: draft.cityEn || draft.cityAr },
    location: { ar: draft.locationAr, en: draft.locationEn || draft.locationAr },
    priceLabel: { ar: draft.priceLabelAr, en: draft.priceLabelEn || draft.priceLabelAr },
    measureLabel: draft.measureLabel,
    featured: draft.featured,
    images: images.length ? images : current?.images ?? [fallbackImage],
    specs: draft.specs,
    createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10),
    publishDate: draft.publishDate,
    expireDate: draft.expireDate,
    auctionDate: draft.auctionDate,
    auctionTime: draft.auctionTime,
    beneficiary: { ar: draft.beneficiaryAr, en: draft.beneficiaryEn || draft.beneficiaryAr },
    venue: { ar: draft.venueAr, en: draft.venueEn || draft.venueAr },
    announcementSource: {
      ar: draft.announcementSourceAr,
      en: draft.announcementSourceEn || draft.announcementSourceAr,
    },
    notes: { ar: draft.notesAr, en: draft.notesEn || draft.notesAr },
    mapUrl: draft.mapUrl,
    whatsappPhone: draft.whatsappPhone,
    views: current?.views ?? 0,
    whatsappClicks: current?.whatsappClicks ?? 0,
    seoTitle: { ar: draft.seoTitleAr, en: draft.seoTitleEn },
    seoDescription: { ar: draft.seoDescriptionAr, en: draft.seoDescriptionEn },
    seoKeywords: { ar: draft.seoKeywordsAr, en: draft.seoKeywordsEn },
  };
}

function draftToRequest(draft: ListingDraft, current?: Listing): UpsertListingBody {
  const listing = draftToListing(draft, current?.id ?? 0, current);

  return {
    slug: listing.slug,
    title: listing.title,
    summary: listing.summary,
    description: listing.description,
    category: listing.category,
    status: listing.status,
    city: listing.city,
    location: listing.location,
    priceLabel: listing.priceLabel,
    measureLabel: listing.measureLabel,
    featured: listing.featured,
    specs: listing.specs
      .map((spec) => ({
        label: normalizePair(spec.label.ar, spec.label.en),
        value: normalizePair(spec.value.ar, spec.value.en),
      }))
      .filter((spec) => spec.value.ar || spec.value.en),
    publishDate: listing.publishDate || undefined,
    expireDate: listing.expireDate || undefined,
    auctionDate: listing.auctionDate || undefined,
    auctionTime: listing.auctionTime || undefined,
    beneficiary: optionalText(draft.beneficiaryAr, draft.beneficiaryEn),
    venue: optionalText(draft.venueAr, draft.venueEn),
    announcementSource: optionalText(draft.announcementSourceAr, draft.announcementSourceEn),
    notes: optionalText(draft.notesAr, draft.notesEn),
    mapUrl: draft.mapUrl.trim() || undefined,
    whatsappPhone: draft.whatsappPhone.trim() || undefined,
    seoTitle: optionalText(draft.seoTitleAr, draft.seoTitleEn),
    seoDescription: optionalText(draft.seoDescriptionAr, draft.seoDescriptionEn),
    seoKeywords: optionalText(draft.seoKeywordsAr, draft.seoKeywordsEn),
  };
}

export function listingToDraft(listing?: Listing): ListingDraft {
  return {
    titleAr: listing?.title.ar ?? "",
    titleEn: listing?.title.en ?? "",
    category: listing?.category ?? "real-estate",
    status: listing?.status ?? "active",
    thumbnail: listing?.images[0] ?? "",
    gallery: listing?.images.slice(1) ?? [],
    descriptionAr: listing?.description.ar ?? "",
    descriptionEn: listing?.description.en ?? "",
    summaryAr: listing?.summary.ar ?? "",
    summaryEn: listing?.summary.en ?? "",
    locationAr: listing?.location.ar ?? "",
    locationEn: listing?.location.en ?? "",
    cityAr: listing?.city.ar ?? "",
    cityEn: listing?.city.en ?? "",
    priceLabelAr: listing?.priceLabel.ar ?? "",
    priceLabelEn: listing?.priceLabel.en ?? "",
    measureLabel: listing?.measureLabel ?? "",
    specs: listing?.specs ?? [],
    publishDate: listing?.publishDate ?? "",
    expireDate: listing?.expireDate ?? "",
    auctionDate: listing?.auctionDate ?? "",
    auctionTime: listing?.auctionTime?.slice(0, 5) ?? "",
    beneficiaryAr: listing?.beneficiary?.ar ?? "",
    beneficiaryEn: listing?.beneficiary?.en ?? "",
    venueAr: listing?.venue?.ar ?? "",
    venueEn: listing?.venue?.en ?? "",
    announcementSourceAr: listing?.announcementSource?.ar ?? "",
    announcementSourceEn: listing?.announcementSource?.en ?? "",
    notesAr: listing?.notes?.ar ?? "",
    notesEn: listing?.notes?.en ?? "",
    mapUrl: listing?.mapUrl ?? "",
    whatsappPhone: listing?.whatsappPhone ?? "",
    seoTitleAr: listing?.seoTitle?.ar ?? "",
    seoTitleEn: listing?.seoTitle?.en ?? "",
    seoDescriptionAr: listing?.seoDescription?.ar ?? "",
    seoDescriptionEn: listing?.seoDescription?.en ?? "",
    seoKeywordsAr: listing?.seoKeywords?.ar ?? "",
    seoKeywordsEn: listing?.seoKeywords?.en ?? "",
    seoSlug: listing?.slug ?? "",
    featured: listing?.featured ?? false,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const { user: currentUser, authorizedRequest } = useAuth();
  const cachedPublicContent = useRef(readPublicContentCache()).current;
  const [lang, setLang] = useState<Language>("ar");
  const [page, setPage] = useState<Page>("home");
  const [aboutSection, setAboutSection] = useState<AboutSection>("profile");
  const [dashboardView, setDashboardView] = useState<DashboardView>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>(() =>
    (cachedPublicContent.listings ?? []).map(normalizeListing));
  const [featuredListings, setFeaturedListings] = useState<Listing[]>(() =>
    (cachedPublicContent.listings ?? []).map(normalizeListing).filter((listing) => listing.featured).slice(0, 20));
  const [listingsLoading, setListingsLoading] = useState(!cachedPublicContent.listings?.length);
  const [listingsError, setListingsError] = useState("");
  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [adminListingsLoading, setAdminListingsLoading] = useState(false);
  const [adminListingsError, setAdminListingsError] = useState("");
  const [settings, setSettings] = useState<AppSettings>(() =>
    normalizeSettings(cachedPublicContent.settings ?? initialSettings));
  const [aboutContent, setAboutContent] = useState<AboutContent>(() =>
    normalizeAboutContent(cachedPublicContent.about ?? initialAboutContent));
  const [aboutLoading, setAboutLoading] = useState(!cachedPublicContent.about);
  const [aboutError, setAboutError] = useState("");
  const [sectors, setSectors] = useState<Sector[]>(() =>
    normalizeSectors(cachedPublicContent.sectors ?? []));
  const [sectorsLoading, setSectorsLoading] = useState(!cachedPublicContent.sectors?.length);
  const [sectorsError, setSectorsError] = useState("");
  const [services, setServices] = useState<ServiceArticle[]>(() =>
    (cachedPublicContent.services?.length ? cachedPublicContent.services : initialServices).map(normalizeService));
  const [selectedServiceId, setSelectedServiceId] = useState(initialServices[0].id);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [selectedListingDetail, setSelectedListingDetail] = useState<Listing | undefined>();
  const [listingDetailLoading, setListingDetailLoading] = useState(false);
  const [listingDetailError, setListingDetailError] = useState("");
  const listingDetailRequest = useRef(0);
  const [listingCategoryFilter, setListingCategoryFilter] = useState<ListingCategory | "all">("all");
  const [toast, setToast] = useState("");
  const listingsRef = useRef(listings);
  const sectorsRef = useRef(sectors);
  const aboutContentRef = useRef(aboutContent);
  const aboutRefreshStarted = useRef(false);

  const t = copy[lang];
  const selectedListing =
    [...adminListings, ...listings].find((listing) => listing.id === selectedListingId)
    ?? (selectedListingDetail?.id === selectedListingId ? selectedListingDetail : undefined)
    ?? listings[0];
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];

  const commitPublicListings = useCallback((nextListings: Listing[]) => {
    listingsRef.current = nextListings;
    setListings(nextListings);
    setFeaturedListings(nextListings.filter((listing) => listing.featured).slice(0, 20));
    updatePublicContentCache({ listings: nextListings });
  }, []);

  const loadPublicListings = useCallback(async () => {
    setListingsLoading(listingsRef.current.length === 0);
    setListingsError("");
    try {
      const first = await elHabashyApi.public.listings({ page: 0, size: 24, sort: "createdAt,desc" });
      const firstListings = first.content.map(listingFromResponse);
      commitPublicListings(firstListings);
      setListingsLoading(false);

      const remaining = first.totalPages > 1
        ? await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) =>
            elHabashyApi.public.listings({ page: index + 1, size: 24, sort: "createdAt,desc" })))
        : [];
      if (remaining.length) {
        commitPublicListings([
          ...firstListings,
          ...remaining.flatMap((pageResponse) => pageResponse.content).map(listingFromResponse),
        ]);
      }
    } catch (error) {
      if (!listingsRef.current.length) {
        setListingsError(error instanceof Error ? error.message : "تعذر تحميل الإعلانات.");
      }
    } finally {
      setListingsLoading(false);
    }
  }, [commitPublicListings]);

  const loadSectors = useCallback(async () => {
    setSectorsLoading(sectorsRef.current.length === 0);
    setSectorsError("");
    try {
      const response = await elHabashyApi.public.sectors();
      const nextSectors = normalizeSectors(response.map(sectorFromResponse).filter((sector): sector is Sector => sector !== null));
      sectorsRef.current = nextSectors;
      setSectors(nextSectors);
      updatePublicContentCache({ sectors: nextSectors });
    } catch (error) {
      if (!sectorsRef.current.length) {
        setSectorsError(error instanceof Error ? error.message : "تعذر تحميل القطاعات.");
      }
    } finally {
      setSectorsLoading(false);
    }
  }, []);

  const loadPublicSettings = useCallback(async () => {
    try {
      const response = await elHabashyApi.public.settings();
      const nextSettings = normalizeSettings(response);
      setSettings(nextSettings);
      updatePublicContentCache({ settings: nextSettings });
    } catch {
      setSettings((current) => normalizeSettings(current));
    }
  }, []);

  const reloadServices = useCallback(async () => {
    try {
      const response = await elHabashyApi.public.services();
      const nextServices = response.map(normalizeService)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setServices(nextServices);
      updatePublicContentCache({ services: nextServices });
    } catch {
      setServices((current) => current.length ? current : initialServices.map(normalizeService));
    }
  }, []);

  const reloadAboutContent = useCallback(async () => {
    setAboutLoading(!cachedPublicContent.about && !aboutContentRef.current.profile.headline.ar);
    setAboutError("");
    try {
      const response = currentUser?.role === "ADMIN"
        ? await elHabashyApi.admin.content.about(authorizedRequest)
        : await elHabashyApi.public.about();
      const nextAboutContent = normalizeAboutContent(response);
      aboutContentRef.current = nextAboutContent;
      setAboutContent(nextAboutContent);
      if (currentUser?.role !== "ADMIN") {
        updatePublicContentCache({ about: nextAboutContent });
      }
    } catch (error) {
      if (!cachedPublicContent.about || currentUser?.role === "ADMIN") {
        setAboutError(error instanceof Error ? error.message : "تعذر تحميل محتوى نبذة عن الشركة.");
      }
      setAboutContent((current) => normalizeAboutContent(current));
    } finally {
      setAboutLoading(false);
    }
  }, [authorizedRequest, cachedPublicContent.about, currentUser?.role]);

  const reloadContent = useCallback(async () => {
    await Promise.all([loadPublicListings(), loadSectors(), loadPublicSettings(), reloadServices()]);
  }, [loadPublicListings, loadPublicSettings, loadSectors, reloadServices]);

  const reloadAdminListings = useCallback(async () => {
    if (currentUser?.role !== "ADMIN") {
      setAdminListings([]);
      return;
    }
    setAdminListingsLoading(true);
    setAdminListingsError("");
    try {
      const first = await elHabashyApi.admin.content.listings(authorizedRequest, {
        page: 0,
        size: 100,
        sort: "createdAt,desc",
      });
      const remaining = first.totalPages > 1
        ? await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) =>
            elHabashyApi.admin.content.listings(authorizedRequest, { page: index + 1, size: 100, sort: "createdAt,desc" })))
        : [];
      setAdminListings([first, ...remaining].flatMap((pageResponse) => pageResponse.content).map(listingFromResponse));
    } catch (error) {
      setAdminListingsError(error instanceof Error ? error.message : "تعذر تحميل إعلانات لوحة التحكم.");
    } finally {
      setAdminListingsLoading(false);
    }
  }, [authorizedRequest, currentUser?.role]);

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
    void reloadContent();
  }, [reloadContent]);

  useEffect(() => {
    if (page !== "about" && page !== "dashboard") return;
    if (aboutRefreshStarted.current && currentUser?.role !== "ADMIN") return;
    aboutRefreshStarted.current = true;
    void reloadAboutContent();
  }, [currentUser?.role, page, reloadAboutContent]);

  useEffect(() => {
    void reloadAdminListings();
  }, [reloadAdminListings]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      page,
      aboutSection,
      dashboardView,
      mobileOpen,
      listings,
      featuredListings,
      listingsLoading,
      listingsError,
      adminListings,
      adminListingsLoading,
      adminListingsError,
      subscribers: initialSubscribers,
      settings,
      aboutContent,
      aboutLoading,
      aboutError,
      sectors,
      sectorsLoading,
      sectorsError,
      services,
      selectedService,
      selectedListing,
      listingDetailLoading,
      listingDetailError,
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
        const requestId = ++listingDetailRequest.current;
        const publicListing = listings.find((listing) => listing.id === id);
        const candidate = publicListing ?? adminListings.find((listing) => listing.id === id);
        setSelectedListingId(id);
        setSelectedListingDetail(candidate);
        setListingDetailError("");
        setPage("details");
        setMobileOpen(false);

        if (publicListing) {
          setListingDetailLoading(true);
          void elHabashyApi.public.listing(publicListing.slug)
            .then((response) => {
              if (listingDetailRequest.current !== requestId) return;
              const detail = listingFromResponse(response);
              setSelectedListingDetail(detail);
              setListings((current) => current.map((listing) => listing.id === detail.id ? detail : listing));
              setFeaturedListings((current) => current.map((listing) => listing.id === detail.id ? detail : listing));
            })
            .catch((error) => {
              if (listingDetailRequest.current === requestId) {
                setListingDetailError(error instanceof Error ? error.message : "تعذر تحميل تفاصيل الإعلان.");
              }
            })
            .finally(() => {
              if (listingDetailRequest.current === requestId) setListingDetailLoading(false);
            });
        } else {
          setListingDetailLoading(false);
        }
      },
      getWhatsAppUrl(listing, phone = settings.whatsappNumber) {
        const targetPhone = listing.whatsappPhone || phone || settings.whatsappNumber;
        const title = listing.title[lang] || listing.title.ar || listing.title.en;
        const sectorTitle = sectors.find((sector) => sector.id === listing.category)?.title[lang] || listing.category;
        const template = lang === "ar" ? settings.whatsappMessageAr : settings.whatsappMessageEn;
        const routedMessage = (template || "{title}")
          .replace(/\{title\}/g, title)
          .replace(/\{category\}/g, sectorTitle)
          .replace(/\{id\}/g, String(listing.id));
        return `https://wa.me/${targetPhone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(routedMessage)}`;
      },
      trackWhatsApp(id) {
        const listing = listings.find((item) => item.id === id)
          ?? adminListings.find((item) => item.id === id)
          ?? (selectedListingDetail?.id === id ? selectedListingDetail : undefined);
        if (!listing) return;

        const increment = (item: Listing) => item.id === id
          ? { ...item, whatsappClicks: item.whatsappClicks + 1 }
          : item;
        setListings((current) => current.map(increment));
        setFeaturedListings((current) => current.map(increment));
        setSelectedListingDetail((current) => current?.id === id ? increment(current) : current);

        void elHabashyApi.public.trackWhatsappClick(listing.slug).then((engagement) => {
          const reconcile = (item: Listing) => item.id === id
            ? { ...item, views: engagement.views, whatsappClicks: engagement.whatsappClicks }
            : item;
          setListings((current) => current.map(reconcile));
          setFeaturedListings((current) => current.map(reconcile));
          setSelectedListingDetail((current) => current?.id === id ? reconcile(current) : current);
        }).catch(() => {
          // Opening WhatsApp must never be blocked by an analytics failure.
        });
      },
      async searchListings(query) {
        const response = await elHabashyApi.public.listings({
          ...query,
          page: query.page ?? 0,
          size: query.size ?? 100,
        });
        const results = response.content.map(listingFromResponse);
        setListings((current) => {
          const merged = new Map(current.map((listing) => [listing.id, listing]));
          results.forEach((listing) => merged.set(listing.id, listing));
          return [...merged.values()];
        });
        return results;
      },
      toggleFavorite(id) {
        if (!currentUser) {
          setToast(t.favoriteLoginRequired);
          setPage("login");
          return;
        }
        setToast(lang === "ar" ? "سيتم توفير المفضلة قريبًا." : "Favorites will be available soon.");
      },
      reloadContent,
      reloadAdminListings,
      async addListing(draft, media) {
        if (!media) throw new Error("A main listing image is required.");
        const response = await elHabashyApi.admin.content.createListing(
          authorizedRequest,
          draftToRequest(draft),
          media,
        );
        const nextListing = listingFromResponse(response);
        setAdminListings((current) => [nextListing, ...current.filter((listing) => listing.id !== nextListing.id)]);
        setSelectedListingId(nextListing.id);
        await reloadContent();
        setToast(t.success);
        return nextListing;
      },
      async updateListing(id, draft) {
        const current = adminListings.find((listing) => listing.id === id) ?? listings.find((listing) => listing.id === id);
        const response = await elHabashyApi.admin.content.updateListing(authorizedRequest, id, draftToRequest(draft, current));
        const updated = listingFromResponse(response);
        setAdminListings((items) => items.map((listing) => listing.id === id ? updated : listing));
        setSelectedListingDetail((detail) => detail?.id === id ? updated : detail);
        await reloadContent();
        setToast(t.success);
        return updated;
      },
      async deleteListing(id) {
        await elHabashyApi.admin.content.deleteListing(authorizedRequest, id);
        setAdminListings((current) => current.filter((listing) => listing.id !== id));
        setSelectedListingDetail((detail) => detail?.id === id ? undefined : detail);
        await reloadContent();
        setToast(t.success);
      },
      async updateListingStatus(id, status) {
        const response = await elHabashyApi.admin.content.updateListingStatus(authorizedRequest, id, status);
        const updated = listingFromResponse(response);
        setAdminListings((current) => current.map((listing) => listing.id === id ? updated : listing));
        setSelectedListingDetail((detail) => detail?.id === id ? updated : detail);
        await reloadContent();
        setToast(t.success);
        return updated;
      },
      async uploadListingMedia(listingId, file, role, options) {
        try {
          const media = await elHabashyApi.admin.media.upload(authorizedRequest, listingId, file, role, options);
          await Promise.all([reloadAdminListings(), reloadContent()]);
          return media;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") throw error;
          await reloadAdminListings();
          throw error;
        }
      },
      async watchListingMedia(listingId, media, options) {
        try {
          const completed = await elHabashyApi.admin.media.watch(
            authorizedRequest,
            listingId,
            media,
            options,
          );
          await Promise.all([reloadAdminListings(), reloadContent()]);
          return completed;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") throw error;
          await reloadAdminListings();
          throw error;
        }
      },
      async deleteListingMedia(listingId, mediaId) {
        await elHabashyApi.admin.media.delete(authorizedRequest, listingId, mediaId);
        await Promise.all([reloadAdminListings(), reloadContent()]);
      },
      async updateSettings(nextSettings) {
        const response = await elHabashyApi.admin.content.updateSettings(authorizedRequest, nextSettings);
        const normalized = normalizeSettings(response);
        setSettings(normalized);
        updatePublicContentCache({ settings: normalized });
        setToast(t.settingsSaved);
        return normalized;
      },
      async updateSector(id, sector) {
        const response = await elHabashyApi.admin.content.updateSector(authorizedRequest, id, sector);
        const updated = sectorFromResponse(response);
        if (!updated) throw new Error("القطاع الذي أعاده الخادم غير معروف.");
        const nextSectors = normalizeSectors(sectorsRef.current.map((item) => (item.id === id ? updated : item)));
        sectorsRef.current = nextSectors;
        setSectors(nextSectors);
        updatePublicContentCache({ sectors: nextSectors });
        setToast(t.success);
        return updated;
      },
      reloadAboutContent,
      async updateAboutProfile(profile) {
        const updated = await elHabashyApi.admin.content.updateAboutProfile(authorizedRequest, profile);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async createAboutPerson(person) {
        const created = await elHabashyApi.admin.content.createAboutPerson(authorizedRequest, person);
        await reloadAboutContent();
        setToast(t.success);
        return created;
      },
      async updateAboutPerson(id, person) {
        const updated = await elHabashyApi.admin.content.updateAboutPerson(authorizedRequest, id, person);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async deleteAboutPerson(id) {
        await elHabashyApi.admin.content.deleteAboutPerson(authorizedRequest, id);
        await reloadAboutContent();
        setToast(t.success);
      },
      async createAboutDepartment(department) {
        const created = await elHabashyApi.admin.content.createAboutDepartment(authorizedRequest, department);
        await reloadAboutContent();
        setToast(t.success);
        return created;
      },
      async updateAboutDepartment(id, department) {
        const updated = await elHabashyApi.admin.content.updateAboutDepartment(authorizedRequest, id, department);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async deleteAboutDepartment(id) {
        await elHabashyApi.admin.content.deleteAboutDepartment(authorizedRequest, id);
        await reloadAboutContent();
        setToast(t.success);
      },
      async createCertificate(certificate) {
        const created = await elHabashyApi.admin.content.createAboutCertificate(authorizedRequest, certificate);
        await reloadAboutContent();
        setToast(t.success);
        return created;
      },
      async updateCertificate(id, certificate) {
        const updated = await elHabashyApi.admin.content.updateAboutCertificate(authorizedRequest, id, certificate);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async deleteCertificate(id) {
        await elHabashyApi.admin.content.deleteAboutCertificate(authorizedRequest, id);
        await reloadAboutContent();
        setToast(t.success);
      },
      async createWorkCategory(category) {
        const created = await elHabashyApi.admin.content.createAboutWorkCategory(authorizedRequest, category);
        await reloadAboutContent();
        setToast(t.success);
        return created;
      },
      async updateWorkCategory(id, category) {
        const updated = await elHabashyApi.admin.content.updateAboutWorkCategory(authorizedRequest, id, category);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async deleteWorkCategory(id) {
        await elHabashyApi.admin.content.deleteAboutWorkCategory(authorizedRequest, id);
        await reloadAboutContent();
        setToast(t.success);
      },
      async createWorkEntry(categoryId, entry) {
        const created = await elHabashyApi.admin.content.createAboutWorkEntry(authorizedRequest, categoryId, entry);
        await reloadAboutContent();
        setToast(t.success);
        return created;
      },
      async updateWorkEntry(id, entry) {
        const updated = await elHabashyApi.admin.content.updateAboutWorkEntry(authorizedRequest, id, entry);
        await reloadAboutContent();
        setToast(t.success);
        return updated;
      },
      async deleteWorkEntry(id) {
        await elHabashyApi.admin.content.deleteAboutWorkEntry(authorizedRequest, id);
        await reloadAboutContent();
        setToast(t.success);
      },
      async uploadAboutImage(file) {
        const response = await elHabashyApi.admin.content.uploadAboutImage(authorizedRequest, file);
        return response.url;
      },
      reloadServices,
      selectService(id) {
        setSelectedServiceId(id);
        setPage("service-details");
        setMobileOpen(false);
      },
      async addService(draft) {
        const created = normalizeService(await elHabashyApi.admin.content.createService(
          authorizedRequest,
          serviceDraftToRequest(draft),
        ));
        await reloadServices();
        setToast(t.success);
        return created;
      },
      async updateService(id, draft) {
        const updated = normalizeService(await elHabashyApi.admin.content.updateService(
          authorizedRequest,
          id,
          serviceDraftToRequest(draft),
        ));
        await reloadServices();
        setToast(t.success);
        return updated;
      },
      async deleteService(id) {
        await elHabashyApi.admin.content.deleteService(authorizedRequest, id);
        await reloadServices();
        setToast(t.success);
      },
      async uploadServiceImage(file) {
        const response = await elHabashyApi.admin.content.uploadServiceImage(authorizedRequest, file);
        return response.url;
      },
      setToast,
    }),
    [
      adminListings,
      adminListingsError,
      adminListingsLoading,
      authorizedRequest,
      currentUser,
      aboutContent,
      aboutLoading,
      aboutError,
      aboutSection,
      dashboardView,
      lang,
      listingCategoryFilter,
      listingDetailError,
      listingDetailLoading,
      listings,
      featuredListings,
      listingsError,
      listingsLoading,
      mobileOpen,
      page,
      reloadAdminListings,
      reloadAboutContent,
      reloadContent,
      reloadServices,
      selectedListing,
      selectedListingDetail,
      settings,
      sectors,
      sectorsError,
      sectorsLoading,
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
