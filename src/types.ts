import type { ReactNode } from "react";

export type Language = "ar" | "en";

export type Page = "home" | "listings" | "details" | "login" | "register" | "dashboard";

export type DashboardView =
  | "overview"
  | "listings"
  | "create"
  | "edit"
  | "requests"
  | "request-details"
  | "users";

export type ListingStatus = "active" | "inactive" | "closed" | "coming-soon";

export type ListingCategory = "cars" | "real-estate" | "antiques" | "waste";

export type RequestStatus =
  | "NEW"
  | "CONTACTED"
  | "DOCUMENT_SENT"
  | "WAITING_RESPONSE"
  | "CLOSED"
  | "REJECTED";

export type CustomerType = "individual" | "company";

export type LocalizedText = {
  ar: string;
  en: string;
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
  views: number;
  bookletRequests: number;
  whatsappClicks: number;
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
};

export type UploadedFile = {
  id: number;
  name: string;
  url: string;
};

export type BookletRequest = {
  id: number;
  listingId: number;
  fullName: string;
  whatsapp: string;
  email: string;
  customerType: CustomerType;
  notes: string;
  files: UploadedFile[];
  status: RequestStatus;
  internalNotes: string;
  createdAt: string;
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
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
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
