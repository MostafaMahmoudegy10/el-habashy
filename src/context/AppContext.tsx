import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { initialListings, initialSubscribers } from "../data/properties";
import { copy } from "../lib/i18n";
import type {
  AuthMode,
  Language,
  Listing,
  ListingDraft,
  ListingStatus,
  Page,
  User,
} from "../types";

type AppContextValue = {
  lang: Language;
  page: Page;
  mobileOpen: boolean;
  listings: Listing[];
  subscribers: typeof initialSubscribers;
  selectedListing: Listing;
  savedIds: number[];
  compareIds: number[];
  authMode: AuthMode | null;
  currentUser: User | null;
  toast: string;
  t: (typeof copy)[Language];
  setLang: (lang: Language) => void;
  navigate: (page: Page) => void;
  setMobileOpen: (value: boolean) => void;
  selectListing: (id: number) => void;
  toggleSaved: (id: number) => void;
  toggleCompare: (id: number) => void;
  getWhatsAppUrl: (listing: Listing) => string;
  trackWhatsApp: (id: number) => void;
  addListing: (draft: ListingDraft) => void;
  updateListingStatus: (id: number, status: ListingStatus) => void;
  toggleFeatured: (id: number) => void;
  deleteListing: (id: number) => void;
  setAuthMode: (mode: AuthMode | null) => void;
  completeAuth: (mode: AuthMode, name: string) => void;
  setToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const ownerWhatsapp = "201000000000";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function AppProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Language>("ar");
  const [page, setPage] = useState<Page>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedListingId, setSelectedListingId] = useState(initialListings[0].id);
  const [savedIds, setSavedIds] = useState<number[]>([2]);
  const [compareIds, setCompareIds] = useState<number[]>([1, 2]);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  const t = copy[lang];
  const selectedListing = listings.find((listing) => listing.id === selectedListingId) ?? listings[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      page,
      mobileOpen,
      listings,
      subscribers: initialSubscribers,
      selectedListing,
      savedIds,
      compareIds,
      authMode,
      currentUser,
      toast,
      t,
      setLang,
      navigate(nextPage) {
        setPage(nextPage);
        setMobileOpen(false);
      },
      setMobileOpen,
      selectListing(id) {
        setSelectedListingId(id);
        setPage("listings");
        setMobileOpen(false);
      },
      toggleSaved(id) {
        setSavedIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
        setToast(t.toastUpdated);
      },
      toggleCompare(id) {
        setCompareIds((current) => {
          if (current.includes(id)) return current.filter((item) => item !== id);
          return [...current, id].slice(-3);
        });
        setToast(t.toastUpdated);
      },
      getWhatsAppUrl(listing) {
        const message =
          lang === "ar"
            ? `أهلاً، محتاج كراسة الشروط الخاصة بـ ${listing.title.ar}`
            : `Hello, I need the Terms Booklet for ${listing.title.en}`;
        return `https://wa.me/${ownerWhatsapp}?text=${encodeURIComponent(message)}`;
      },
      trackWhatsApp(id) {
        setListings((current) =>
          current.map((listing) =>
            listing.id === id
              ? {
                  ...listing,
                  bookletClicks: listing.bookletClicks + 1,
                  whatsappClicks: listing.whatsappClicks + 1,
                }
              : listing,
          ),
        );
        setToast(t.directWhatsappReady);
      },
      addListing(draft) {
        const nextId = Math.max(...listings.map((listing) => listing.id)) + 1;
        const nextListing: Listing = {
          id: nextId,
          slug: slugify(draft.titleEn || draft.titleAr || `listing-${nextId}`),
          title: { ar: draft.titleAr, en: draft.titleEn || draft.titleAr },
          category: draft.category,
          status: draft.status,
          city: { ar: draft.cityAr, en: draft.cityEn || draft.cityAr },
          area: { ar: draft.areaAr, en: draft.areaEn || draft.areaAr },
          location: { ar: draft.areaAr, en: draft.areaEn || draft.areaAr },
          description: {
            ar: "عرض تمت إضافته من لوحة التحكم وجاهز للربط بالباك إند.",
            en: "Listing added from the dashboard and ready for backend integration.",
          },
          priceLabel: { ar: draft.priceLabelAr, en: draft.priceLabelEn || draft.priceLabelAr },
          price: 0,
          measureLabel: draft.measureLabel,
          featured: draft.featured,
          images: [
            draft.image ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82",
          ],
          documents: [
            { ar: "كراسة الشروط", en: "Terms Booklet" },
            { ar: "ملخص العرض", en: "Listing Summary" },
          ],
          tags: [
            { ar: "جديد", en: "New" },
            { ar: draft.status === "active" ? "نشط" : "منتهي", en: draft.status },
          ],
          visits: 0,
          bookletClicks: 0,
          whatsappClicks: 0,
        };
        setListings((current) => [nextListing, ...current]);
        setSelectedListingId(nextListing.id);
        setToast(t.toastListingAdded);
      },
      updateListingStatus(id, status) {
        setListings((current) =>
          current.map((listing) => (listing.id === id ? { ...listing, status } : listing)),
        );
        setToast(t.toastUpdated);
      },
      toggleFeatured(id) {
        setListings((current) =>
          current.map((listing) =>
            listing.id === id ? { ...listing, featured: !listing.featured } : listing,
          ),
        );
        setToast(t.toastUpdated);
      },
      deleteListing(id) {
        setListings((current) => current.filter((listing) => listing.id !== id));
        setToast(t.toastUpdated);
      },
      setAuthMode,
      completeAuth(mode, name) {
        setCurrentUser({
          name,
          role: mode === "login" ? "admin" : "customer",
        });
        setAuthMode(null);
        setToast(t.accountReady);
      },
      setToast,
    }),
    [
      authMode,
      compareIds,
      currentUser,
      lang,
      listings,
      mobileOpen,
      page,
      savedIds,
      selectedListing,
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
