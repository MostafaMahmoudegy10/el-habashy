import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileArchive,
  FileCheck2,
  FileText,
  Filter,
  Gem,
  Globe2,
  Grid2X2,
  Heart,
  Home,
  ImagePlus,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  NotebookTabs,
  Phone,
  Plus,
  QrCode,
  Recycle,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  Star,
  TrendingUp,
  UploadCloud,
  UserCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import brandLogo from "./assets/el-habashy-logo.svg";
import { initialRequests, properties, subscribers } from "./data/properties";
import type {
  BookletRequest,
  CustomerType,
  Language,
  Property,
  PropertyStatus,
  PropertyType,
  RequestStatus,
  Section,
} from "./types";

type AuthMode = "login" | "signup";

const copy = {
  ar: {
    brand: "الحبشي",
    brandSub: "شركة اتحاد الخبراء المثمنين",
    navHome: "الرئيسية",
    navProperties: "العروض",
    navCompare: "المقارنة",
    navDashboard: "لوحة التحكم",
    heroEyebrow: "منصة عرض للأصول بدون مزايدات أونلاين",
    heroTitle: "اعرض النشط والمنتهي من العقارات والسيارات والأنتيكات والمخلفات",
    heroText:
      "واجهة بسيطة لعرض البيانات والصور والمستندات، واستقبال طلبات كراسة الشروط ومتابعتها من لوحة التحكم.",
    browse: "تصفح العروض",
    requestBooklet: "طلب كراسة الشروط",
    featured: "عروض مميزة",
    smartSearch: "بحث ذكي",
    details: "التفاصيل",
    save: "حفظ",
    saved: "محفوظ",
    compare: "مقارنة",
    remove: "إزالة",
    availableDocs: "المستندات المتاحة",
    qrTitle: "QR لصفحة العرض",
    filtersTitle: "فلترة العروض",
    searchPlaceholder: "ابحث بالمدينة، المنطقة، القسم أو الحالة",
    allCities: "كل المدن",
    allTypes: "كل الأقسام",
    allStatuses: "كل الحالات",
    budget: "الميزانية",
    reset: "إعادة ضبط",
    noResults: "لا توجد نتائج مطابقة",
    noResultsText: "جرّب تغيير كلمة البحث أو الفلاتر.",
    requestForm: "طلب كراسة الشروط",
    fullName: "الاسم بالكامل",
    whatsapp: "رقم واتساب",
    email: "البريد الإلكتروني",
    property: "العرض / الأصل",
    customerType: "نوع العميل",
    individual: "فرد",
    company: "شركة",
    notes: "ملاحظات",
    uploadFiles: "رفع المستندات المطلوبة",
    submit: "إرسال الطلب",
    success:
      "تم استلام طلبك بنجاح، وسيتم التواصل معك عبر واتساب لإرسال كراسة الشروط.",
    dashboard: "لوحة التحكم",
    requests: "طلبات الكراسة",
    properties: "العروض",
    subscribers: "المشتركون",
    analytics: "التحليلات",
    totalProperties: "إجمالي العروض",
    totalRequests: "إجمالي الطلبات",
    newRequests: "طلبات جديدة",
    sentBooklets: "كراسات مرسلة",
    contacted: "تم التواصل",
    closed: "طلبات مغلقة",
    status: "الحالة",
    assignedTo: "المسؤول",
    internalNotes: "ملاحظات داخلية",
    uploadedFiles: "الملفات المرفوعة",
    sendWhatsapp: "إرسال واتساب",
    exportExcel: "تصدير Excel",
    preview: "معاينة",
    downloadAll: "تحميل الكل",
    reminder: "تنبيه",
    reminderText: "يوجد طلب جديد مر عليه أكثر من 24 ساعة ويحتاج متابعة.",
    broadcast: "إرسال تنبيه مستهدف",
    visits: "زيارات",
    requestsCount: "طلبات",
    conversion: "تحويل",
    whatsappClicks: "ضغطات واتساب",
    priceStatusUpdated: "تحديث السعر/الحالة",
    notifyMe: "أبلغني بالعروض الجديدة",
    namePlaceholder: "اكتب الاسم",
    fileHint: "بطاقة، سجل تجاري، بطاقة ضريبية، إثبات دفع أو ملف مخصص",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    adminLogin: "دخول الإدارة",
    customerSignup: "حساب عميل جديد",
    password: "كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    continue: "متابعة",
    authHint: "الدخول للإدارة لمتابعة الطلبات، وإنشاء الحساب للعملاء لحفظ العروض والاشتراك في التنبيهات.",
    accountReady: "تم تجهيز واجهة الحساب التجريبية",
  },
  en: {
    brand: "El Habashy",
    brandSub: "Asset Showcase",
    navHome: "Home",
    navProperties: "Listings",
    navCompare: "Compare",
    navDashboard: "Dashboard",
    heroEyebrow: "Asset showcase without online bidding",
    heroTitle: "Show active and ended listings across real estate, cars, antiques, and scrap",
    heroText:
      "A simple interface for images, documents, booklet requests, and admin follow-up.",
    browse: "Browse Listings",
    requestBooklet: "Request Booklet",
    featured: "Featured Listings",
    smartSearch: "Smart Search",
    details: "Details",
    save: "Save",
    saved: "Saved",
    compare: "Compare",
    remove: "Remove",
    availableDocs: "Available Documents",
    qrTitle: "Listing Page QR",
    filtersTitle: "Listing Filters",
    searchPlaceholder: "Search by city, area, category, or status",
    allCities: "All cities",
    allTypes: "All categories",
    allStatuses: "All statuses",
    budget: "Budget",
    reset: "Reset",
    noResults: "No matching results",
    noResultsText: "Try changing your search or filters.",
    requestForm: "Booklet Request",
    fullName: "Full name",
    whatsapp: "WhatsApp number",
    email: "Email",
    property: "Listing / Asset",
    customerType: "Customer type",
    individual: "Individual",
    company: "Company",
    notes: "Notes",
    uploadFiles: "Upload required documents",
    submit: "Submit request",
    success:
      "Your request has been received successfully. We will contact you on WhatsApp to send the Terms & Conditions Booklet.",
    dashboard: "Dashboard",
    requests: "Booklet Requests",
    properties: "Listings",
    subscribers: "Subscribers",
    analytics: "Analytics",
    totalProperties: "Total listings",
    totalRequests: "Total requests",
    newRequests: "New requests",
    sentBooklets: "Booklets sent",
    contacted: "Contacted",
    closed: "Closed requests",
    status: "Status",
    assignedTo: "Assigned to",
    internalNotes: "Internal notes",
    uploadedFiles: "Uploaded files",
    sendWhatsapp: "Send via WhatsApp",
    exportExcel: "Export Excel",
    preview: "Preview",
    downloadAll: "Download all",
    reminder: "Reminder",
    reminderText: "A new request has been waiting for more than 24 hours.",
    broadcast: "Send targeted alert",
    visits: "Visits",
    requestsCount: "Requests",
    conversion: "Conversion",
    whatsappClicks: "WhatsApp clicks",
    priceStatusUpdated: "Price/status update",
    notifyMe: "Notify me about new listings",
    namePlaceholder: "Enter name",
    fileHint: "ID, commercial register, tax card, proof of payment, or custom file",
    login: "Login",
    signup: "Sign up",
    adminLogin: "Admin Login",
    customerSignup: "Create Customer Account",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    continue: "Continue",
    authHint: "Admins sign in to manage requests, while customers create accounts to save listings and receive alerts.",
    accountReady: "Demo account interface is ready",
  },
};

const typeLabel: Record<PropertyType, Record<Language, string>> = {
  "real-estate": { ar: "عقارات", en: "Real Estate" },
  cars: { ar: "سيارات", en: "Cars" },
  antiques: { ar: "أنتيكات", en: "Antiques" },
  scrap: { ar: "مخلفات / سكراب", en: "Scrap" },
};

const statusLabel: Record<PropertyStatus, Record<Language, string>> = {
  active: { ar: "نشط", en: "Active" },
  ended: { ar: "منتهي", en: "Ended" },
};

const requestStatusLabel: Record<RequestStatus, Record<Language, string>> = {
  NEW: { ar: "جديد", en: "New" },
  CONTACTED: { ar: "تم التواصل", en: "Contacted" },
  DOCUMENT_SENT: { ar: "تم إرسال الكراسة", en: "Booklet Sent" },
  WAITING_RESPONSE: { ar: "بانتظار الرد", en: "Waiting Response" },
  CLOSED: { ar: "مغلق", en: "Closed" },
  REJECTED: { ar: "مرفوض", en: "Rejected" },
};

const statusTone: Record<PropertyStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ended: "bg-slate-100 text-slate-600 ring-slate-200",
};

const typeIcon: Record<PropertyType, typeof Home> = {
  "real-estate": Building2,
  cars: CarFront,
  antiques: Gem,
  scrap: Recycle,
};

const requestTone: Record<RequestStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 ring-amber-200",
  CONTACTED: "bg-blue-50 text-blue-700 ring-blue-200",
  DOCUMENT_SENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WAITING_RESPONSE: "bg-violet-50 text-violet-700 ring-violet-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};

function App() {
  const [lang, setLang] = useState<Language>("ar");
  const [section, setSection] = useState<Section>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0].id);
  const [requestPropertyId, setRequestPropertyId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([2]);
  const [compareIds, setCompareIds] = useState<number[]>([1, 2]);
  const [requests, setRequests] = useState<BookletRequest[]>(initialRequests);
  const [activeRequestId, setActiveRequestId] = useState(initialRequests[0].id);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: "admin" | "customer" } | null>(null);
  const [toast, setToast] = useState("");

  const t = copy[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) ?? properties[0];
  const requestProperty = properties.find((property) => property.id === requestPropertyId) ?? selectedProperty;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [dir, lang]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next: Section) => {
    setSection(next);
    setMobileOpen(false);
  };

  const toggleSaved = (id: number) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setToast(lang === "ar" ? "تم تحديث العروض المحفوظة" : "Saved listings updated");
  };

  const toggleCompare = (id: number) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-3);
    });
    setToast(lang === "ar" ? "تم تحديث قائمة المقارنة" : "Compare list updated");
  };

  const openDetails = (id: number) => {
    setSelectedPropertyId(id);
    setSection("properties");
  };

  const openRequest = (id: number) => {
    setRequestPropertyId(id);
  };

  const addRequest = (payload: Omit<BookletRequest, "id" | "status" | "assignedTo" | "createdAt" | "internalNotes" | "whatsappClicks">) => {
    const nextRequest: BookletRequest = {
      ...payload,
      id: `REQ-${1050 + requests.length}`,
      status: "NEW",
      assignedTo: lang === "ar" ? "غير محدد" : "Unassigned",
      createdAt: new Date().toISOString(),
      internalNotes: "",
      whatsappClicks: 0,
    };

    setRequests((current) => [nextRequest, ...current]);
    setActiveRequestId(nextRequest.id);
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
    setToast(lang === "ar" ? "تم تحديث حالة الطلب" : "Request status updated");
  };

  const trackWhatsapp = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, whatsappClicks: request.whatsappClicks + 1 } : request,
      ),
    );
    setToast(lang === "ar" ? "تم تسجيل ضغطة واتساب" : "WhatsApp click tracked");
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-stone-50 font-sans text-slate-950 selection:bg-amber-200 selection:text-slate-950"
    >
      <SiteHeader
        lang={lang}
        section={section}
        mobileOpen={mobileOpen}
        currentUser={currentUser}
        onNavigate={navigate}
        onAuth={setAuthMode}
        onToggleLang={() => setLang((current) => (current === "ar" ? "en" : "ar"))}
        onToggleMobile={() => setMobileOpen((value) => !value)}
      />

      <main>
        {section === "home" && (
          <>
            <Hero lang={lang} onNavigate={navigate} onRequest={openRequest} />
            <FeaturedProperties
              lang={lang}
              savedIds={savedIds}
              compareIds={compareIds}
              onDetails={openDetails}
              onRequest={openRequest}
              onSave={toggleSaved}
              onCompare={toggleCompare}
            />
            <SubscriberBand lang={lang} onToast={setToast} />
          </>
        )}

        {section === "properties" && (
          <PropertyExplorer
            lang={lang}
            selectedProperty={selectedProperty}
            savedIds={savedIds}
            compareIds={compareIds}
            onDetails={openDetails}
            onRequest={openRequest}
            onSave={toggleSaved}
            onCompare={toggleCompare}
          />
        )}

        {section === "compare" && (
          <ComparePage
            lang={lang}
            propertyIds={compareIds}
            onNavigate={navigate}
            onRemove={toggleCompare}
            onRequest={openRequest}
          />
        )}

        {section === "dashboard" && (
          <AdminDashboard
            lang={lang}
            requests={requests}
            activeRequestId={activeRequestId}
            onActiveRequest={setActiveRequestId}
            onStatusChange={updateRequestStatus}
            onWhatsappClick={trackWhatsapp}
            onToast={setToast}
          />
        )}
      </main>

      <Footer lang={lang} onNavigate={navigate} />

      {requestPropertyId ? (
        <BookletRequestModal
          lang={lang}
          property={requestProperty}
          onClose={() => setRequestPropertyId(null)}
          onSubmit={addRequest}
        />
      ) : null}

      {authMode ? (
        <AuthModal
          lang={lang}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onSubmit={(mode, name) => {
            setCurrentUser({
              name,
              role: mode === "login" ? "admin" : "customer",
            });
            setAuthMode(null);
            setToast(t.accountReady);
          }}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-soft">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function SiteHeader({
  lang,
  section,
  mobileOpen,
  currentUser,
  onNavigate,
  onAuth,
  onToggleLang,
  onToggleMobile,
}: {
  lang: Language;
  section: Section;
  mobileOpen: boolean;
  currentUser: { name: string; role: "admin" | "customer" } | null;
  onNavigate: (section: Section) => void;
  onAuth: (mode: AuthMode) => void;
  onToggleLang: () => void;
  onToggleMobile: () => void;
}) {
  const t = copy[lang];
  const items: Array<{ id: Section; label: string; icon: typeof Home }> = [
    { id: "home", label: t.navHome, icon: Home },
    { id: "properties", label: t.navProperties, icon: Building2 },
    { id: "compare", label: t.navCompare, icon: SquareStack },
    { id: "dashboard", label: t.navDashboard, icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex min-w-0 items-center gap-3 text-start"
        >
          <span className="grid h-12 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-amber-200 bg-white shadow-card">
            <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain p-1" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-lg font-black tracking-normal">{t.brand}</strong>
            <small className="block truncate text-xs font-bold text-slate-500">{t.brandSub}</small>
          </span>
        </button>

        <nav
          className={`${mobileOpen ? "grid" : "hidden"} absolute inset-x-4 top-[72px] gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-soft lg:static lg:flex lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-extrabold transition ${
                  section === item.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-stone-100 hover:text-slate-950"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 lg:hidden">
            <button
              type="button"
              onClick={() => onAuth("login")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700"
            >
              <LogIn size={17} />
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => onAuth("signup")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-3 text-sm font-black text-slate-950"
            >
              <UserPlus size={17} />
              {t.signup}
            </button>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="hidden h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-black text-emerald-700 md:flex">
              <UserCheck size={17} />
              {currentUser.name}
            </span>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => onAuth("login")}
                className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm hover:border-amber-300"
              >
                <LogIn size={17} />
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => onAuth("signup")}
                className="flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white shadow-sm hover:bg-slate-800"
              >
                <UserPlus size={17} />
                {t.signup}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm hover:border-amber-300"
          >
            <Globe2 size={17} />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <button
            type="button"
            onClick={onToggleMobile}
            className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({
  lang,
  onNavigate,
  onRequest,
}: {
  lang: Language;
  onNavigate: (section: Section) => void;
  onRequest: (id: number) => void;
}) {
  const t = copy[lang];
  const featured = properties.filter((property) => property.status === "active").slice(0, 4);
  const activeCount = properties.filter((property) => property.status === "active").length;
  const endedCount = properties.filter((property) => property.status === "ended").length;

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-6 lg:py-12">
        <div className="flex min-h-[430px] flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
            <Sparkles size={17} />
            {t.heroEyebrow}
          </div>
          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">{t.heroText}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {(Object.keys(typeLabel) as PropertyType[]).map((item) => {
              const Icon = typeIcon[item];
              return (
                <div key={item} className="rounded-lg border border-slate-200 bg-stone-50 p-3">
                  <Icon className="text-amber-600" size={20} />
                  <strong className="mt-2 block text-sm font-black">{typeLabel[item][lang]}</strong>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate("properties")}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 shadow-card transition hover:bg-amber-300"
            >
              <Search size={18} />
              {t.browse}
            </button>
            <button
              type="button"
              onClick={() => onRequest(1)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-stone-100"
            >
              <NotebookTabs size={18} />
              {t.requestBooklet}
            </button>
          </div>
        </div>

        <div className="grid content-start gap-3 rounded-lg border border-slate-200 bg-stone-50 p-3 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-4">
              <span className="text-xs font-black text-slate-500">{statusLabel.active[lang]}</span>
              <strong className="mt-1 block text-2xl font-black text-emerald-700">{activeCount}</strong>
            </div>
            <div className="rounded-lg bg-white p-4">
              <span className="text-xs font-black text-slate-500">{statusLabel.ended[lang]}</span>
              <strong className="mt-1 block text-2xl font-black text-slate-700">{endedCount}</strong>
            </div>
          </div>
          {featured.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => onNavigate("properties")}
              className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-lg bg-white p-2 text-start text-slate-950 transition hover:shadow-card"
            >
              <img
                src={property.images[0]}
                alt={property.title[lang]}
                className="h-20 w-full rounded-lg object-cover"
              />
              <span className="min-w-0 py-1">
                <span className="mb-2 inline-flex rounded-md bg-stone-100 px-2 py-1 text-xs font-black text-slate-600">
                  {typeLabel[property.type][lang]}
                </span>
                <strong className="line-clamp-2 block text-sm font-black leading-6">
                  {property.title[lang]}
                </strong>
                <small className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                  <MapPin size={13} />
                  {property.city[lang]} · {property.size}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProperties({
  lang,
  savedIds,
  compareIds,
  onDetails,
  onRequest,
  onSave,
  onCompare,
}: {
  lang: Language;
  savedIds: number[];
  compareIds: number[];
  onDetails: (id: number) => void;
  onRequest: (id: number) => void;
  onSave: (id: number) => void;
  onCompare: (id: number) => void;
}) {
  const t = copy[lang];
  const featured = properties.filter((property) => property.featured);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
      <SectionHeading
        eyebrow={t.featured}
        title={lang === "ar" ? "أقسام واضحة وعروض سهلة التصفح" : "Clear categories and easy browsing"}
        subtitle={
          lang === "ar"
            ? "كل كارت يعرض القسم، الحالة، المكان، والزر الأساسي لطلب كراسة الشروط بدون زحمة."
            : "Each card shows category, status, location, and the booklet request button without clutter."
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((property) => (
          <PropertyCard
            key={property.id}
            lang={lang}
            property={property}
            saved={savedIds.includes(property.id)}
            compared={compareIds.includes(property.id)}
            onDetails={onDetails}
            onRequest={onRequest}
            onSave={onSave}
            onCompare={onCompare}
          />
        ))}
      </div>
    </section>
  );
}

function PropertyExplorer({
  lang,
  selectedProperty,
  savedIds,
  compareIds,
  onDetails,
  onRequest,
  onSave,
  onCompare,
}: {
  lang: Language;
  selectedProperty: Property;
  savedIds: number[];
  compareIds: number[];
  onDetails: (id: number) => void;
  onRequest: (id: number) => void;
  onSave: (id: number) => void;
  onCompare: (id: number) => void;
}) {
  const t = copy[lang];
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState<"all" | PropertyType>("all");
  const [status, setStatus] = useState<"all" | PropertyStatus>("all");
  const [budget, setBudget] = useState("all");

  const cities = Array.from(new Set(properties.map((property) => property.city[lang])));
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return properties.filter((property) => {
      const blob = [
        property.title[lang],
        property.city[lang],
        property.area[lang],
        property.location[lang],
        property.description[lang],
        typeLabel[property.type][lang],
        statusLabel[property.status][lang],
      ]
        .join(" ")
        .toLowerCase();
      const budgetMatches =
        budget === "all" ||
        (budget === "low" && property.price < 5000000) ||
        (budget === "mid" && property.price >= 5000000 && property.price < 10000000) ||
        (budget === "high" && property.price >= 10000000);

      return (
        (!term || blob.includes(term)) &&
        (city === "all" || property.city[lang] === city) &&
        (type === "all" || property.type === type) &&
        (status === "all" || property.status === status) &&
        budgetMatches
      );
    });
  }, [budget, city, lang, search, status, type]);

  const reset = () => {
    setSearch("");
    setCity("all");
    setType("all");
    setStatus("all");
    setBudget("all");
  };

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-24">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{t.smartSearch}</span>
            <h2 className="mt-1 text-xl font-black">{t.filtersTitle}</h2>
          </div>
          <SlidersHorizontal className="text-slate-400" size={22} />
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            {t.smartSearch}
            <span className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-11 w-full rounded-lg border border-slate-200 bg-stone-50 px-10 text-sm text-slate-950 outline-none ring-amber-200 transition focus:border-amber-400 focus:ring-4"
              />
            </span>
          </label>

          <SelectField label={t.allCities} value={city} onChange={setCity}>
            <option value="all">{t.allCities}</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField label={t.allTypes} value={type} onChange={(value) => setType(value as "all" | PropertyType)}>
            <option value="all">{t.allTypes}</option>
            {(Object.keys(typeLabel) as PropertyType[]).map((item) => (
              <option key={item} value={item}>
                {typeLabel[item][lang]}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t.allStatuses}
            value={status}
            onChange={(value) => setStatus(value as "all" | PropertyStatus)}
          >
            <option value="all">{t.allStatuses}</option>
            {(Object.keys(statusLabel) as PropertyStatus[]).map((item) => (
              <option key={item} value={item}>
                {statusLabel[item][lang]}
              </option>
            ))}
          </SelectField>

          <SelectField label={t.budget} value={budget} onChange={setBudget}>
            <option value="all">{t.budget}</option>
            <option value="low">{lang === "ar" ? "أقل من 5 مليون" : "Under 5M"}</option>
            <option value="mid">{lang === "ar" ? "5 - 10 مليون" : "5M - 10M"}</option>
            <option value="high">{lang === "ar" ? "أكثر من 10 مليون" : "Above 10M"}</option>
          </SelectField>

          <button
            type="button"
            onClick={reset}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-stone-100"
          >
            <Filter size={17} />
            {t.reset}
          </button>
        </div>
      </aside>

      <div className="grid gap-6">
        <PropertyDetails
          lang={lang}
          property={selectedProperty}
          saved={savedIds.includes(selectedProperty.id)}
          compared={compareIds.includes(selectedProperty.id)}
          onRequest={onRequest}
          onSave={onSave}
          onCompare={onCompare}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              lang={lang}
              property={property}
              saved={savedIds.includes(property.id)}
              compared={compareIds.includes(property.id)}
              onDetails={onDetails}
              onRequest={onRequest}
              onSave={onSave}
              onCompare={onCompare}
            />
          ))}
        </div>

        {!filtered.length ? (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <div>
              <Search className="mx-auto text-slate-300" size={34} />
              <strong className="mt-3 block text-lg font-black">{t.noResults}</strong>
              <span className="mt-1 block text-sm font-bold text-slate-500">{t.noResultsText}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PropertyCard({
  lang,
  property,
  saved,
  compared,
  onDetails,
  onRequest,
  onSave,
  onCompare,
}: {
  lang: Language;
  property: Property;
  saved: boolean;
  compared: boolean;
  onDetails: (id: number) => void;
  onRequest: (id: number) => void;
  onSave: (id: number) => void;
  onCompare: (id: number) => void;
}) {
  const t = copy[lang];
  const TypeIcon = typeIcon[property.type];

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[1.35] overflow-hidden bg-slate-100">
        <img src={property.images[0]} alt={property.title[lang]} className="h-full w-full object-cover" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-black ring-1 ${statusTone[property.status]}`}>
            {statusLabel[property.status][lang]}
          </span>
          {property.featured ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2.5 py-1 text-xs font-black text-amber-300">
              <Star size={13} />
              {lang === "ar" ? "مميز" : "Featured"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-500">
            <span className="inline-flex items-center gap-1">
              <TypeIcon size={14} />
              {typeLabel[property.type][lang]}
            </span>
            <span>{property.size}</span>
          </div>
          <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7">{property.title[lang]}</h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
            {property.description[lang]}
          </p>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            {property.city[lang]} · {property.area[lang]}
          </span>
          <span className="flex items-center gap-2 text-slate-950">
            <CircleDollarSign size={16} className="text-amber-600" />
            {property.priceLabel[lang]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <span key={tag.en} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {tag[lang]}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onRequest(property.id)}
            className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <NotebookTabs size={17} />
            {t.requestBooklet}
          </button>
          <button
            type="button"
            onClick={() => onDetails(property.id)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-stone-100"
          >
            <Eye size={16} />
            {t.details}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSave(property.id)}
              className={`grid h-10 place-items-center rounded-lg border text-sm font-black ${
                saved
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-stone-100"
              }`}
              title={saved ? t.saved : t.save}
              aria-label={saved ? t.saved : t.save}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => onCompare(property.id)}
              className={`grid h-10 place-items-center rounded-lg border text-sm font-black ${
                compared
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-stone-100"
              }`}
              title={t.compare}
              aria-label={t.compare}
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PropertyDetails({
  lang,
  property,
  saved,
  compared,
  onRequest,
  onSave,
  onCompare,
}: {
  lang: Language;
  property: Property;
  saved: boolean;
  compared: boolean;
  onRequest: (id: number) => void;
  onSave: (id: number) => void;
  onCompare: (id: number) => void;
}) {
  const t = copy[lang];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `https://elhabashy.com/listings/${property.slug}`,
  )}`;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-2 p-3 sm:grid-cols-[1.4fr_0.9fr]">
          <img src={property.images[0]} alt={property.title[lang]} className="h-full min-h-80 w-full rounded-lg object-cover" />
          <div className="grid gap-2">
            <img src={property.images[1]} alt={property.title[lang]} className="h-40 w-full rounded-lg object-cover sm:h-full" />
            <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-stone-50 p-4 text-center">
              <ImagePlus className="text-slate-400" size={28} />
              <span className="mt-2 text-sm font-black text-slate-600">
                {lang === "ar" ? "معرض صور العرض" : "Listing gallery"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid content-between gap-5 border-t border-slate-200 p-5 lg:border-s-1 lg:border-t-0">
          <div>
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ring-1 ${statusTone[property.status]}`}>
              {statusLabel[property.status][lang]}
            </span>
            <h2 className="mt-3 text-2xl font-black leading-9">{property.title[lang]}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{property.description[lang]}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: typeLabel[property.type][lang], value: property.size, icon: Building2 },
              { label: property.city[lang], value: property.area[lang], icon: MapPin },
              { label: t.visits, value: property.visits.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), icon: Eye },
              { label: t.requestsCount, value: property.requests.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"), icon: NotebookTabs },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={`${item.label}-${item.value}`} className="rounded-lg bg-stone-50 p-3">
                  <Icon className="text-amber-600" size={18} />
                  <strong className="mt-2 block text-sm font-black">{item.value}</strong>
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-black">{t.availableDocs}</h3>
            <div className="grid gap-2">
              {property.documents.map((document) => (
                <div key={document.en} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FileCheck2 size={17} className="text-emerald-600" />
                    {document[lang]}
                  </span>
                  <ShieldCheck size={17} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black">{t.qrTitle}</h3>
                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {lang === "ar" ? "مناسب للطباعة على البروشور" : "Ready for printed brochures"}
                </span>
              </div>
              <img src={qrUrl} alt={t.qrTitle} className="h-20 w-20 rounded-lg bg-white p-1" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <button
              type="button"
              onClick={() => onRequest(property.id)}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300"
            >
              <NotebookTabs size={18} />
              {t.requestBooklet}
            </button>
            <button
              type="button"
              onClick={() => onSave(property.id)}
              className={`grid h-12 w-full place-items-center rounded-lg border px-4 sm:w-12 ${
                saved ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={saved ? t.saved : t.save}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => onCompare(property.id)}
              className={`grid h-12 w-full place-items-center rounded-lg border px-4 sm:w-12 ${
                compared ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={t.compare}
            >
              <Grid2X2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookletRequestModal({
  lang,
  property,
  onClose,
  onSubmit,
}: {
  lang: Language;
  property: Property;
  onClose: () => void;
  onSubmit: (
    payload: Omit<BookletRequest, "id" | "status" | "assignedTo" | "createdAt" | "internalNotes" | "whatsappClicks">,
  ) => void;
}) {
  const t = copy[lang];
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("individual");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      onSubmit({
        propertyId: property.id,
        fullName: fullName || (lang === "ar" ? "عميل جديد" : "New Customer"),
        whatsapp: whatsapp || "+201000000000",
        email: email || "customer@example.com",
        customerType,
        notes,
        files: files.length ? files : ["id-image.jpg", "proof-of-payment.pdf"],
      });
      setLoading(false);
      setSubmitted(true);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{property.title[lang]}</span>
            <h2 className="mt-1 text-xl font-black">{t.requestForm}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-stone-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="grid place-items-center p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="mt-4 text-2xl font-black">{lang === "ar" ? "تم بنجاح" : "Success"}</h3>
            <p className="mt-3 max-w-md text-base font-bold leading-8 text-slate-600">{t.success}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 rounded-lg bg-slate-950 px-5 text-sm font-black text-white"
            >
              {lang === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label={t.fullName} value={fullName} onChange={setFullName} placeholder={t.namePlaceholder} required />
              <TextField label={t.whatsapp} value={whatsapp} onChange={setWhatsapp} placeholder="+20 100 000 0000" required />
              <TextField label={t.email} value={email} onChange={setEmail} placeholder="name@example.com" type="email" />
              <TextField label={t.property} value={property.title[lang]} onChange={() => undefined} disabled />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-600">{t.customerType}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["individual", "company"] as CustomerType[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCustomerType(item)}
                    className={`h-11 rounded-lg border text-sm font-black ${
                      customerType === item
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item === "individual" ? t.individual : t.company}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-black text-slate-600">
              {t.notes}
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="rounded-lg border border-slate-200 bg-stone-50 p-3 text-sm text-slate-950 outline-none ring-amber-200 focus:border-amber-400 focus:ring-4"
                placeholder={lang === "ar" ? "أي ملاحظات أو ملفات إضافية مطلوبة..." : "Any notes or additional required files..."}
              />
            </label>

            <label className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-stone-50 p-6 text-center hover:border-amber-400">
              <UploadCloud className="text-amber-600" size={34} />
              <strong className="mt-3 text-sm font-black text-slate-800">{t.uploadFiles}</strong>
              <span className="mt-1 text-xs font-bold text-slate-500">{t.fileHint}</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const names = Array.from(event.target.files ?? []).map((file) => file.name);
                  setFiles(names);
                }}
              />
            </label>

            {files.length ? (
              <div className="grid gap-2">
                {files.map((file) => (
                  <span key={file} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-bold text-slate-600">
                    <FileText size={17} />
                    {file}
                  </span>
                ))}
              </div>
            ) : null}

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? <Clock3 size={18} /> : <Send size={18} />}
              {loading ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...") : t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AuthModal({
  lang,
  mode,
  onModeChange,
  onClose,
  onSubmit,
}: {
  lang: Language;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSubmit: (mode: AuthMode, name: string) => void;
}) {
  const t = copy[lang];
  const [name, setName] = useState(mode === "login" ? (lang === "ar" ? "مدير الحبشي" : "El Habashy Admin") : "");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [interest, setInterest] = useState<PropertyType>("real-estate");

  const isLogin = mode === "login";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(mode, name || (isLogin ? t.adminLogin : t.customerSignup));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="grid max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="relative hidden min-h-[620px] overflow-hidden bg-slate-950 p-7 text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=82"
            alt="El Habashy secure access"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="w-40 rounded-lg bg-white p-3 shadow-card">
              <img src={brandLogo} alt={t.brand} className="w-full" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-amber-200">
                <ShieldCheck size={17} />
                {isLogin ? t.adminLogin : t.customerSignup}
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight">
                {isLogin
                  ? lang === "ar"
                    ? "دخول آمن لإدارة الطلبات والملفات"
                    : "Secure access for requests and files"
                  : lang === "ar"
                    ? "حساب عميل لحفظ العروض واستقبال التنبيهات"
                    : "Customer account for saved listings and alerts"}
              </h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{t.authHint}</p>
            </div>
          </div>
        </aside>

        <section className="max-h-[94vh] overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-14 place-items-center overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm lg:hidden">
                <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain p-1" />
              </span>
              <div>
                <span className="text-xs font-black uppercase text-amber-700">
                  {isLogin ? t.adminLogin : t.customerSignup}
                </span>
                <h2 className="mt-1 text-xl font-black">{isLogin ? t.login : t.signup}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-stone-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-5 p-5">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
              {(["login", "signup"] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onModeChange(item)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-black transition ${
                    mode === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
                  {item === "login" ? t.login : t.signup}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 shrink-0 text-amber-600" size={20} />
                <p className="text-sm font-bold leading-7 text-slate-600">{t.authHint}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {!isLogin ? (
                <TextField label={t.fullName} value={name} onChange={setName} placeholder={t.namePlaceholder} required />
              ) : null}
              <TextField label={t.email} value={email} onChange={setEmail} placeholder="admin@elhabashy.com" type="email" required />
              {!isLogin ? (
                <TextField label={t.whatsapp} value={whatsapp} onChange={setWhatsapp} placeholder="+20 100 000 0000" required />
              ) : null}
              <TextField label={t.password} value={password} onChange={setPassword} placeholder="••••••••" type="password" required />
              {!isLogin ? (
                <SelectField
                  label={lang === "ar" ? "القسم المهتم به" : "Interested category"}
                  value={interest}
                  onChange={(value) => setInterest(value as PropertyType)}
                >
                  {(Object.keys(typeLabel) as PropertyType[]).map((item) => (
                    <option key={item} value={item}>
                      {typeLabel[item][lang]}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <SelectField label={lang === "ar" ? "نوع الحساب" : "Account type"} value="admin" onChange={() => undefined}>
                  <option value="admin">{lang === "ar" ? "مالك / أدمن" : "Owner / Admin"}</option>
                  <option value="employee">{lang === "ar" ? "موظف" : "Employee"}</option>
                </SelectField>
              )}
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-500" />
                {t.rememberMe}
              </label>
              {isLogin ? (
                <button type="button" className="text-start text-sm font-black text-amber-700">
                  {t.forgotPassword}
                </button>
              ) : (
                <span className="text-sm font-bold text-slate-500">
                  {lang === "ar" ? "سيتم استخدام البيانات للتنبيهات والطلبات فقط." : "Used only for alerts and requests."}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 hover:bg-amber-300"
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {t.continue}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function ComparePage({
  lang,
  propertyIds,
  onNavigate,
  onRemove,
  onRequest,
}: {
  lang: Language;
  propertyIds: number[];
  onNavigate: (section: Section) => void;
  onRemove: (id: number) => void;
  onRequest: (id: number) => void;
}) {
  const t = copy[lang];
  const compared = properties.filter((property) => propertyIds.includes(property.id));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        eyebrow={t.compare}
        title={lang === "ar" ? "مقارنة سريعة بين العروض" : "Quick comparison between listings"}
        subtitle={
          lang === "ar"
            ? "اعرض حتى 3 عناصر جنب بعض مع القسم، الحالة، القيمة، وطلب الكراسة."
            : "Show up to 3 items side by side with category, status, value, and booklet CTA."
        }
      />

      {compared.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {compared.map((property) => (
            <article key={property.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
              <img src={property.images[0]} alt={property.title[lang]} className="h-52 w-full rounded-lg object-cover" />
              <span className={`mt-4 inline-flex rounded-md px-2.5 py-1 text-xs font-black ring-1 ${statusTone[property.status]}`}>
                {statusLabel[property.status][lang]}
              </span>
              <h3 className="mt-3 min-h-16 text-lg font-black leading-8">{property.title[lang]}</h3>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
                <span>{typeLabel[property.type][lang]}</span>
                <span>{property.city[lang]} · {property.area[lang]}</span>
                <span>{property.size}</span>
                <strong className="text-base text-slate-950">{property.priceLabel[lang]}</strong>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onRequest(property.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white"
                >
                  <NotebookTabs size={16} />
                  {t.requestBooklet}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(property.id)}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-black text-slate-700"
                >
                  <X size={16} />
                  {t.remove}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <SquareStack className="mx-auto text-slate-300" size={38} />
            <strong className="mt-4 block text-lg font-black">
              {lang === "ar" ? "لم تختر عروض للمقارنة بعد" : "No listings selected for comparison yet"}
            </strong>
            <button
              type="button"
              onClick={() => onNavigate("properties")}
              className="mt-5 h-11 rounded-lg bg-slate-950 px-5 text-sm font-black text-white"
            >
              {t.browse}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminDashboard({
  lang,
  requests,
  activeRequestId,
  onActiveRequest,
  onStatusChange,
  onWhatsappClick,
  onToast,
}: {
  lang: Language;
  requests: BookletRequest[];
  activeRequestId: string;
  onActiveRequest: (id: string) => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onWhatsappClick: (id: string) => void;
  onToast: (message: string) => void;
}) {
  const t = copy[lang];
  const active = requests.find((request) => request.id === activeRequestId) ?? requests[0];
  const activeProperty = properties.find((property) => property.id === active.propertyId) ?? properties[0];
  const newCount = requests.filter((request) => request.status === "NEW").length;
  const sentCount = requests.filter((request) => request.status === "DOCUMENT_SENT").length;
  const contactedCount = requests.filter((request) => request.status === "CONTACTED").length;
  const closedCount = requests.filter((request) => request.status === "CLOSED").length;
  const totalVisits = properties.reduce((sum, property) => sum + property.visits, 0);
  const totalPropertyRequests = properties.reduce((sum, property) => sum + property.requests, 0);
  const conversion = Math.round((totalPropertyRequests / totalVisits) * 1000) / 10;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:px-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-slate-950 p-5 text-white shadow-soft lg:flex-row lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-amber-300">
            <LayoutDashboard size={18} />
            {t.dashboard}
          </span>
          <h1 className="mt-2 text-3xl font-black">
            {lang === "ar" ? "متابعة العروض وطلبات كراسة الشروط من مكان واحد" : "Manage listings and booklet requests from one place"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
            {lang === "ar"
              ? "لوحة MVP بسيطة: عروض نشطة ومنتهية، طلبات، ملفات، واتساب، مشتركين وتحليلات."
              : "Simple MVP dashboard: active and ended listings, requests, files, WhatsApp, subscribers, and analytics."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToast(lang === "ar" ? "تم تجهيز ملف Excel تجريبي" : "Demo Excel export prepared")}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-black text-slate-950"
        >
          <Download size={17} />
          {t.exportExcel}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard lang={lang} icon={Building2} label={t.totalProperties} value={properties.length} />
        <StatCard lang={lang} icon={NotebookTabs} label={t.totalRequests} value={requests.length} />
        <StatCard lang={lang} icon={Bell} label={t.newRequests} value={newCount} tone="amber" />
        <StatCard lang={lang} icon={UserCheck} label={t.contacted} value={contactedCount} tone="blue" />
        <StatCard lang={lang} icon={FileCheck2} label={t.sentBooklets} value={sentCount} tone="emerald" />
        <StatCard lang={lang} icon={Check} label={t.closed} value={closedCount} tone="slate" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 shrink-0" size={20} />
          <div>
            <strong className="block text-sm font-black">{t.reminder}</strong>
            <span className="text-sm font-bold leading-6">{t.reminderText}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-black uppercase text-amber-700">{t.requests}</span>
              <h2 className="text-xl font-black">{lang === "ar" ? "إدارة الطلبات" : "Request Management"}</h2>
            </div>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder={t.searchPlaceholder}
                className="h-10 rounded-lg border border-slate-200 bg-stone-50 px-9 text-sm outline-none ring-amber-200 focus:border-amber-400 focus:ring-4"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-start font-black">ID</th>
                  <th className="px-4 py-3 text-start font-black">{t.fullName}</th>
                  <th className="px-4 py-3 text-start font-black">{t.property}</th>
                  <th className="px-4 py-3 text-start font-black">{t.status}</th>
                  <th className="px-4 py-3 text-start font-black">{t.assignedTo}</th>
                  <th className="px-4 py-3 text-start font-black">{t.whatsappClicks}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const property = properties.find((item) => item.id === request.propertyId) ?? properties[0];
                  return (
                    <tr
                      key={request.id}
                      onClick={() => onActiveRequest(request.id)}
                      className={`cursor-pointer border-t border-slate-100 transition hover:bg-stone-50 ${
                        activeRequestId === request.id ? "bg-amber-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-4 font-black text-slate-700">{request.id}</td>
                      <td className="px-4 py-4">
                        <strong className="block font-black">{request.fullName}</strong>
                        <span className="text-xs font-bold text-slate-500">{request.whatsapp}</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-600">{property.title[lang]}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-black ring-1 ${requestTone[request.status]}`}>
                          {requestStatusLabel[request.status][lang]}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-600">{request.assignedTo}</td>
                      <td className="px-4 py-4 font-black text-slate-700">{request.whatsappClicks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <RequestDetailsPanel
          lang={lang}
          request={active}
          property={activeProperty}
          onStatusChange={onStatusChange}
          onWhatsappClick={onWhatsappClick}
          onToast={onToast}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-amber-700">{t.properties}</span>
              <h2 className="text-xl font-black">{lang === "ar" ? "إدارة العروض" : "Listing Management"}</h2>
            </div>
            <button className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white" type="button">
              <Plus size={16} />
              {lang === "ar" ? "عرض جديد" : "New Listing"}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {properties.slice(0, 4).map((property) => (
              <div key={property.id} className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 p-2">
                <img src={property.images[0]} alt={property.title[lang]} className="h-24 w-full rounded-lg object-cover" />
                <div className="min-w-0">
                  <strong className="line-clamp-2 text-sm font-black leading-6">{property.title[lang]}</strong>
                  <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-black ring-1 ${statusTone[property.status]}`}>
                    {statusLabel[property.status][lang]}
                  </span>
                  <div className="mt-2 flex gap-2 text-xs font-bold text-slate-500">
                    <span>{property.visits} {t.visits}</span>
                    <span>{property.requests} {t.requestsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <span className="text-xs font-black uppercase text-amber-700">{t.analytics}</span>
          <h2 className="mb-4 text-xl font-black">{lang === "ar" ? "مؤشرات سريعة" : "Quick Metrics"}</h2>
          <div className="grid gap-3">
            <MetricRow icon={Eye} label={t.visits} value={totalVisits.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} />
            <MetricRow icon={NotebookTabs} label={t.requestsCount} value={totalPropertyRequests.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} />
            <MetricRow icon={TrendingUp} label={t.conversion} value={`${conversion}%`} />
            <MetricRow icon={MessageCircle} label={t.whatsappClicks} value={properties.reduce((sum, property) => sum + property.whatsappClicks, 0).toString()} />
          </div>
          <div className="mt-5 rounded-lg bg-stone-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <strong className="text-sm font-black">{lang === "ar" ? "الأكثر طلباً" : "Most Requested"}</strong>
              <BarChart3 className="text-amber-600" size={18} />
            </div>
            <div className="grid gap-2">
              {properties.slice(0, 3).map((property) => (
                <div key={property.id}>
                  <div className="mb-1 flex justify-between gap-3 text-xs font-bold text-slate-600">
                    <span className="line-clamp-1">{property.title[lang]}</span>
                    <span>{property.requests}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(property.requests, 140)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-black uppercase text-amber-700">{t.subscribers}</span>
            <h2 className="text-xl font-black">{lang === "ar" ? "تنبيهات مستهدفة للمشتركين" : "Targeted Subscriber Broadcasts"}</h2>
          </div>
          <button
            type="button"
            onClick={() => onToast(lang === "ar" ? "تم إرسال تنبيه تجريبي للمجموعة المستهدفة" : "Demo targeted alert sent")}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-black text-slate-950"
          >
            <Mail size={16} />
            {t.broadcast}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {subscribers.map((subscriber) => (
            <div key={subscriber.id} className="rounded-lg border border-slate-200 p-4">
              <strong className="block font-black">{subscriber.name}</strong>
              <span className="mt-1 block text-sm font-bold text-slate-500">{subscriber.email}</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">{subscriber.city}</span>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">
                  {typeLabel[subscriber.propertyType][lang]}
                </span>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-slate-600">{subscriber.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function RequestDetailsPanel({
  lang,
  request,
  property,
  onStatusChange,
  onWhatsappClick,
  onToast,
}: {
  lang: Language;
  request: BookletRequest;
  property: Property;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onWhatsappClick: (id: string) => void;
  onToast: (message: string) => void;
}) {
  const t = copy[lang];
  const message =
    lang === "ar"
      ? `أهلاً ${request.fullName}، بخصوص ${property.title.ar}، رابط كراسة الشروط: https://elhabashy.com/booklet/secure-demo`
      : `Hello ${request.fullName}, regarding ${property.title.en}, booklet link: https://elhabashy.com/booklet/secure-demo`;
  const whatsappUrl = `https://wa.me/${request.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-card xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-amber-700">{request.id}</span>
          <h2 className="mt-1 text-xl font-black">{request.fullName}</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{property.title[lang]}</p>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-black ring-1 ${requestTone[request.status]}`}>
          {requestStatusLabel[request.status][lang]}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <InfoLine icon={Phone} label={t.whatsapp} value={request.whatsapp} />
        <InfoLine icon={Mail} label={t.email} value={request.email} />
        <InfoLine
          icon={BriefcaseBusiness}
          label={t.customerType}
          value={request.customerType === "individual" ? t.individual : t.company}
        />
        <InfoLine icon={UserCheck} label={t.assignedTo} value={request.assignedTo} />
      </div>

      <label className="mt-5 grid gap-2 text-sm font-black text-slate-600">
        {t.status}
        <select
          value={request.status}
          onChange={(event) => onStatusChange(request.id, event.target.value as RequestStatus)}
          className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm text-slate-950 outline-none"
        >
          {(Object.keys(requestStatusLabel) as RequestStatus[]).map((status) => (
            <option key={status} value={status}>
              {requestStatusLabel[status][lang]}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 rounded-lg bg-stone-50 p-4">
        <strong className="text-sm font-black">{t.uploadedFiles}</strong>
        <div className="mt-3 grid gap-2">
          {request.files.map((file) => (
            <div key={file} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-600">
                <FileText size={16} />
                <span className="truncate">{file}</span>
              </span>
              <button
                type="button"
                onClick={() => onToast(lang === "ar" ? "معاينة ملف تجريبية" : "Demo file preview")}
                className="text-xs font-black text-amber-700"
              >
                {t.preview}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onToast(lang === "ar" ? "تم تجهيز ملف مضغوط تجريبي" : "Demo archive prepared")}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700"
        >
          <FileArchive size={16} />
          {t.downloadAll}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <strong className="text-sm font-black">{t.internalNotes}</strong>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
          {request.internalNotes || (lang === "ar" ? "لا توجد ملاحظات بعد." : "No notes yet.")}
        </p>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => onWhatsappClick(request.id)}
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-black text-white hover:bg-emerald-500"
      >
        <MessageCircle size={18} />
        {t.sendWhatsapp}
      </a>
    </aside>
  );
}

function SubscriberBand({ lang, onToast }: { lang: Language; onToast: (message: string) => void }) {
  const t = copy[lang];
  return (
    <section className="mx-auto mb-12 w-full max-w-7xl px-4 lg:px-6">
      <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-card lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-amber-700">
            <Bell size={18} />
            {t.notifyMe}
          </span>
          <h2 className="mt-2 text-2xl font-black">
            {lang === "ar" ? "استقبل المهتمين حسب القسم والمدينة والميزانية" : "Capture interested customers by category, city, and budget"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
            {lang === "ar"
              ? "النموذج ده مكانه في الواجهة العامة، ويغذي قائمة المشتركين للرسائل المستهدفة."
              : "This public form feeds the subscriber list for targeted alerts."}
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onToast(lang === "ar" ? "تم حفظ الاشتراك التجريبي" : "Demo subscription saved");
          }}
          className="grid gap-2"
        >
          <input className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none" placeholder={t.fullName} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none" placeholder={t.whatsapp} />
            <input className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm outline-none" placeholder={t.email} />
          </div>
          <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-black text-white" type="submit">
            <Bell size={17} />
            {t.notifyMe}
          </button>
        </form>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <span className="inline-flex items-center gap-2 text-sm font-black text-amber-700">
        <Sparkles size={17} />
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-black leading-tight tracking-normal sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-500 sm:text-base">{subtitle}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-600">
      {label}
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-slate-200 bg-stone-50 px-3 text-sm text-slate-950 outline-none ring-amber-200 transition focus:border-amber-400 focus:ring-4 disabled:text-slate-500"
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
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-stone-50 px-3 pe-9 text-sm text-slate-950 outline-none ring-amber-200 focus:border-amber-400 focus:ring-4"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      </span>
    </label>
  );
}

function StatCard({
  lang,
  icon: Icon,
  label,
  value,
  tone = "amber",
}: {
  lang: Language;
  icon: typeof Home;
  label: string;
  value: number;
  tone?: "amber" | "blue" | "emerald" | "slate";
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${toneClasses[tone]}`}>
        <Icon size={20} />
      </span>
      <strong className="mt-4 block text-2xl font-black">{value.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
      <span className="mt-1 block text-xs font-black text-slate-500">{label}</span>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 p-3">
      <span className="flex items-center gap-2 text-xs font-black text-slate-500">
        <Icon size={16} />
        {label}
      </span>
      <strong className="text-sm font-black text-slate-800">{value}</strong>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <span className="flex items-center gap-2 text-sm font-black text-slate-600">
        <Icon className="text-amber-600" size={18} />
        {label}
      </span>
      <strong className="text-sm font-black">{value}</strong>
    </div>
  );
}

function Footer({ lang, onNavigate }: { lang: Language; onNavigate: (section: Section) => void }) {
  const t = copy[lang];
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-16 place-items-center overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
              <img src={brandLogo} alt={t.brand} className="h-full w-full object-contain p-1" />
            </span>
            <div>
              <strong className="block font-black">{t.brand}</strong>
              <span className="text-xs font-bold text-slate-500">{t.brandSub}</span>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500">
            {lang === "ar"
              ? "واجهة MVP نظيفة لعرض الأصول وإدارة طلبات كراسة الشروط بشكل بسيط."
              : "Clean MVP interface for asset listings and booklet request management."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["home", t.navHome],
            ["properties", t.navProperties],
            ["compare", t.navCompare],
            ["dashboard", t.navDashboard],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id as Section)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-600 hover:bg-stone-100"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default App;
