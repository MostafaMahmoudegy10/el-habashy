import type { ReactNode } from "react";

export type Language = "ar" | "en";

export type Page = "home" | "about" | "listings" | "details" | "services" | "service-details" | "login" | "register" | "dashboard";

export type AboutSection = "profile" | "previous-work" | "certificates" | "structure";

export type DashboardView =
  | "overview"
  | "listings"
  | "sectors"
  | "create"
  | "import"
  | "edit"
  | "about-content"
  | "about-profile"
  | "about-structure"
  | "about-certificates"
  | "about-work"
  | "services-content"
  | "arbitration-content"
  | "valuation-content"
  | "consulting-content"
  | "users"
  | "settings";

export type ListingStatus = "active" | "inactive" | "closed" | "coming-soon";

export type ListingCategory = "real-estate" | "movables" | "cars" | "antiques" | "scrap" | "other";

export type LocalizedText = {
  ar: string;
  en: string;
};

export type Specification = {
  label: LocalizedText;
  value: LocalizedText;
};

export type ListingMediaType = "image" | "video";
export type ListingMediaRole = "thumbnail" | "gallery" | "video";
export type ListingMediaStatus = "uploading" | "processing" | "ready" | "failed";

export type ListingMedia = {
  id: number;
  type: ListingMediaType;
  role: ListingMediaRole;
  status: ListingMediaStatus;
  publicId?: string;
  url?: string;
  fileName: string;
  contentType: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  expectedBytes: number;
  uploadedBytes: number;
  progress: number;
  durationSeconds?: number;
  displayOrder: number;
  failureReason?: string;
};

export type Listing = {
  id: number;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  category: ListingCategory;
  status: ListingStatus;
  city: LocalizedText;
  location: LocalizedText;
  priceLabel: LocalizedText;
  measureLabel: string;
  featured: boolean;
  images: string[];
  media?: ListingMedia[];
  specs: Specification[];
  createdAt: string;
  publishDate?: string;
  expireDate?: string;
  auctionDate?: string;
  auctionTime?: string;
  beneficiary?: LocalizedText;
  venue?: LocalizedText;
  announcementSource?: LocalizedText;
  notes?: LocalizedText;
  mapUrl?: string;
  whatsappPhone?: string;
  views: number;
  whatsappClicks: number;
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
  seoKeywords?: LocalizedText;
  updatedAt?: string;
};

export type ListingDraft = {
  titleAr: string;
  titleEn: string;
  category: ListingCategory;
  status: ListingStatus;
  thumbnail: string;
  gallery: string[];
  descriptionAr: string;
  descriptionEn: string;
  summaryAr: string;
  summaryEn: string;
  locationAr: string;
  locationEn: string;
  cityAr: string;
  cityEn: string;
  priceLabelAr: string;
  priceLabelEn: string;
  measureLabel: string;
  specs: Specification[];
  publishDate: string;
  expireDate: string;
  auctionDate: string;
  auctionTime: string;
  beneficiaryAr: string;
  beneficiaryEn: string;
  venueAr: string;
  venueEn: string;
  announcementSourceAr: string;
  announcementSourceEn: string;
  notesAr: string;
  notesEn: string;
  mapUrl: string;
  whatsappPhone: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  seoKeywordsAr: string;
  seoKeywordsEn: string;
  seoSlug: string;
  featured: boolean;
};

export type Subscriber = {
  id: number;
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  category: ListingCategory;
  budget: string;
};

export type StatCard = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export type AppSettings = {
  whatsappNumber: string;
  whatsappMessageAr: string;
  whatsappMessageEn: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: LocalizedText;
  mapUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
};

export type WorkCategory = {
  id: number;
  title: LocalizedText;
  summary: LocalizedText;
  displayOrder: number;
  entries: WorkEntry[];
  updatedAt?: string;
};

export type WorkEntry = {
  id: number;
  categoryId: number;
  title: LocalizedText;
  client: LocalizedText;
  summary: LocalizedText;
  details: LocalizedText;
  projectYear?: number;
  location: LocalizedText;
  imageUrl?: string;
  displayOrder: number;
  updatedAt?: string;
};

export type Sector = {
  id: ListingCategory;
  title: LocalizedText;
  description: LocalizedText;
  displayOrder?: number;
  updatedAt?: string;
};

export type Certificate = {
  id: number;
  title: LocalizedText;
  issuer: LocalizedText;
  description: LocalizedText;
  issueDate?: string;
  imageUrl?: string;
  displayOrder: number;
  updatedAt?: string;
};

export type AboutProfile = {
  headline: LocalizedText;
  profile: LocalizedText;
  mission: LocalizedText;
  vision: LocalizedText;
  imageUrl?: string;
  startedYear: number;
  updatedAt?: string;
};

export type AboutPerson = {
  id: number;
  name: LocalizedText;
  role: LocalizedText;
  biography: LocalizedText;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  updatedAt?: string;
};

export type AboutDepartment = {
  id: number;
  title: LocalizedText;
  description: LocalizedText;
  displayOrder: number;
  updatedAt?: string;
};

export type AboutContent = {
  profile: AboutProfile;
  people: AboutPerson[];
  departments: AboutDepartment[];
  workCategories: WorkCategory[];
  certificates: Certificate[];
};

export type ServiceKind = "arbitration" | "valuation" | "consulting";

export type ServiceArticle = {
  id: number;
  slug?: string;
  kind: ServiceKind;
  title: LocalizedText;
  summary: LocalizedText;
  content: LocalizedText;
  image: string;
  gallery: string[];
  featured: boolean;
  displayOrder?: number;
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
  seoKeywords?: LocalizedText;
  createdAt: string;
  updatedAt?: string;
};

export type ServiceDraft = {
  kind: ServiceKind;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  contentEn: string;
  image: string;
  gallery: string[];
  featured: boolean;
  displayOrder: number;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  seoKeywordsAr: string;
  seoKeywordsEn: string;
};
