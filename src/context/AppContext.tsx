import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  initialListings,
  initialRequests,
  initialSubscribers,
  initialUsers,
} from "../data/properties";
import { copy } from "../lib/i18n";
import { sanitizeRichText } from "../lib/richText";
import type {
  BookletRequest,
  CustomerType,
  DashboardView,
  Language,
  Listing,
  ListingDraft,
  ListingStatus,
  Page,
  RequestStatus,
  UploadedFile,
  User,
} from "../types";

type RequestDraft = {
  fullName: string;
  whatsapp: string;
  email: string;
  customerType: CustomerType;
  notes: string;
  files: UploadedFile[];
};

type AppContextValue = {
  lang: Language;
  page: Page;
  dashboardView: DashboardView;
  mobileOpen: boolean;
  listings: Listing[];
  requests: BookletRequest[];
  subscribers: typeof initialSubscribers;
  users: User[];
  selectedListing: Listing;
  selectedRequest: BookletRequest | null;
  currentUser: User | null;
  toast: string;
  t: (typeof copy)[Language];
  setLang: (lang: Language) => void;
  navigate: (page: Page) => void;
  setDashboardView: (view: DashboardView) => void;
  setMobileOpen: (value: boolean) => void;
  selectListing: (id: number) => void;
  selectRequest: (id: number) => void;
  getWhatsAppUrl: (listing: Listing, phone?: string) => string;
  trackWhatsApp: (id: number) => void;
  toggleFavorite: (id: number) => void;
  completeAuth: (mode: "login" | "register", payload: { name: string; email: string }) => void;
  addListing: (draft: ListingDraft) => void;
  updateListing: (id: number, draft: ListingDraft) => void;
  deleteListing: (id: number) => void;
  updateListingStatus: (id: number, status: ListingStatus) => void;
  submitBookletRequest: (listingId: number, draft: RequestDraft) => void;
  updateRequestStatus: (id: number, status: RequestStatus) => void;
  updateRequestNotes: (id: number, notes: string) => void;
  setToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const ownerWhatsapp = "201000000000";
const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=84";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function draftToListing(draft: ListingDraft, id: number, current?: Listing): Listing {
  const images = [draft.thumbnail, ...draft.gallery].filter(Boolean);
  return {
    id,
    slug: current?.slug ?? slugify(draft.titleEn || draft.titleAr || `listing-${id}`),
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
    specs: current?.specs ?? [
      { label: { ar: "القسم", en: "Category" }, value: { ar: draft.category, en: draft.category } },
      { label: { ar: "الموقع", en: "Location" }, value: { ar: draft.locationAr, en: draft.locationEn || draft.locationAr } },
      { label: { ar: "الكمية", en: "Quantity" }, value: { ar: draft.measureLabel, en: draft.measureLabel } },
    ],
    createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10),
    views: current?.views ?? 0,
    bookletRequests: current?.bookletRequests ?? 0,
    whatsappClicks: current?.whatsappClicks ?? 0,
    seoTitle: { ar: draft.seoTitleAr, en: draft.seoTitleEn },
    seoDescription: { ar: draft.seoDescriptionAr, en: draft.seoDescriptionEn },
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
    seoTitleAr: listing?.seoTitle?.ar ?? "",
    seoTitleEn: listing?.seoTitle?.en ?? "",
    seoDescriptionAr: listing?.seoDescription?.ar ?? "",
    seoDescriptionEn: listing?.seoDescription?.en ?? "",
    featured: listing?.featured ?? false,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Language>("ar");
  const [page, setPage] = useState<Page>("home");
  const [dashboardView, setDashboardView] = useState<DashboardView>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [requests, setRequests] = useState<BookletRequest[]>(initialRequests);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedListingId, setSelectedListingId] = useState(initialListings[0].id);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(initialRequests[0]?.id ?? null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  const t = copy[lang];
  const selectedListing = listings.find((listing) => listing.id === selectedListingId) ?? listings[0];
  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      page,
      dashboardView,
      mobileOpen,
      listings,
      requests,
      subscribers: initialSubscribers,
      users,
      selectedListing,
      selectedRequest,
      currentUser,
      toast,
      t,
      setLang,
      navigate(nextPage) {
        setPage(nextPage);
        setMobileOpen(false);
      },
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
      selectRequest(id) {
        setSelectedRequestId(id);
        setDashboardView("request-details");
        setPage("dashboard");
      },
      getWhatsAppUrl(listing, phone = ownerWhatsapp) {
        const message =
          lang === "ar"
            ? `أهلا، أحتاج كراسة الشروط الخاصة بـ ${listing.title.ar}`
            : `Hello, I need the terms booklet for ${listing.title.en}`;
        return `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
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
        setCurrentUser((user) =>
          user
            ? {
                ...user,
                favorites: user.favorites.includes(id)
                  ? user.favorites.filter((item) => item !== id)
                  : [...user.favorites, id],
              }
            : user,
        );
        setUsers((current) =>
          current.map((user) =>
            user.id === currentUser.id
              ? {
                  ...user,
                  favorites: user.favorites.includes(id)
                    ? user.favorites.filter((item) => item !== id)
                    : [...user.favorites, id],
                }
              : user,
          ),
        );
      },
      completeAuth(mode, payload) {
        const existing = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
        const user =
          existing ??
          {
            id: Math.max(0, ...users.map((item) => item.id)) + 1,
            name: payload.name || payload.email.split("@")[0],
            email: payload.email,
            role: "customer" as const,
            favorites: [],
          };

        if (!existing) setUsers((current) => [...current, user]);
        setCurrentUser(user);
        setToast(mode === "register" ? t.accountReady : t.loginReady);
        setPage("home");
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
      submitBookletRequest(listingId, draft) {
        const nextId = Math.max(0, ...requests.map((request) => request.id)) + 1;
        const nextRequest: BookletRequest = {
          id: nextId,
          listingId,
          fullName: draft.fullName,
          whatsapp: draft.whatsapp,
          email: draft.email,
          customerType: draft.customerType,
          notes: draft.notes,
          files: draft.files,
          status: "NEW",
          internalNotes: "",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setRequests((current) => [nextRequest, ...current]);
        setListings((current) =>
          current.map((listing) =>
            listing.id === listingId
              ? { ...listing, bookletRequests: listing.bookletRequests + 1 }
              : listing,
          ),
        );
        setToast(t.requestSuccess);
      },
      updateRequestStatus(id, status) {
        setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
      },
      updateRequestNotes(id, notes) {
        setRequests((current) =>
          current.map((request) => (request.id === id ? { ...request, internalNotes: notes } : request)),
        );
      },
      setToast,
    }),
    [
      currentUser,
      dashboardView,
      lang,
      listings,
      mobileOpen,
      page,
      requests,
      selectedListing,
      selectedRequest,
      t,
      toast,
      users,
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
