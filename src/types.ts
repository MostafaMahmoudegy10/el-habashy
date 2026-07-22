import type { ReactNode } from "react";

export type Language = "ar" | "en" | "fr";

export type Page = "home" | "about" | "listings" | "details" | "services" | "service-details" | "login" | "register" | "dashboard";

export type AboutSection = "profile" | "previous-work" | "certificates" | "structure";

export type DashboardView =
  | "overview"
  | "listings"
  | "sectors"
  | "create"
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
  [key: string]: string;
};

export type Specification = {
  label: LocalizedText;
  value: LocalizedText;
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
};

export type ListingDraft = {
  titleAr: string;
  titleEn: string;
  titleFr: string;
  category: ListingCategory;
  status: ListingStatus;
  thumbnail: string;
  gallery: string[];
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr: string;
  summaryAr: string;
  summaryEn: string;
  summaryFr: string;
  locationAr: string;
  locationEn: string;
  locationFr: string;
  cityAr: string;
  cityEn: string;
  cityFr: string;
  priceLabelAr: string;
  priceLabelEn: string;
  priceLabelFr: string;
  measureLabel: string;
  publishDate: string;
  expireDate: string;
  auctionDate: string;
  auctionTime: string;
  beneficiaryAr: string;
  beneficiaryEn: string;
  beneficiaryFr: string;
  venueAr: string;
  venueEn: string;
  venueFr: string;
  announcementSourceAr: string;
  announcementSourceEn: string;
  announcementSourceFr: string;
  notesAr: string;
  notesEn: string;
  notesFr: string;
  mapUrl: string;
  whatsappPhone: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoTitleFr: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  seoDescriptionFr: string;
  seoKeywordsAr: string;
  seoKeywordsEn: string;
  seoKeywordsFr: string;
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

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  favorites: number[];
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
  whatsappMessageFr: string;
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
  items: LocalizedText[];
};

export type Sector = {
  id: ListingCategory;
  title: LocalizedText;
  description: LocalizedText;
};

export type Certificate = {
  id: number;
  title: LocalizedText;
  date: string;
  description: LocalizedText;
  image?: string;
};

export type AboutContent = {
  profile: LocalizedText;
  profileImage?: string;
  workCategories: WorkCategory[];
  certificates: Certificate[];
  structure: {
    image?: string;
    leaders: LocalizedText[];
    departments: LocalizedText[];
  };
};

export type ServiceKind = "arbitration" | "valuation" | "consulting";

export type ServiceArticle = {
  id: number;
  kind: ServiceKind;
  title: LocalizedText;
  summary: LocalizedText;
  content: LocalizedText;
  image: string;
  gallery: string[];
  featured: boolean;
  createdAt: string;
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
};
