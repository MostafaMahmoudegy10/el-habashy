export type Language = "ar" | "en";

export type Page = "home" | "listings" | "about" | "compare" | "dashboard";

export type ListingStatus = "active" | "ended";

export type ListingCategory = "real-estate" | "cars" | "antiques" | "scrap";

export type LocalizedText = {
  ar: string;
  en: string;
};

export type Listing = {
  id: number;
  slug: string;
  title: LocalizedText;
  category: ListingCategory;
  status: ListingStatus;
  city: LocalizedText;
  area: LocalizedText;
  location: LocalizedText;
  description: LocalizedText;
  priceLabel: LocalizedText;
  price: number;
  measureLabel: string;
  featured: boolean;
  images: string[];
  documents: LocalizedText[];
  tags: LocalizedText[];
  visits: number;
  bookletClicks: number;
  whatsappClicks: number;
};

export type ListingDraft = {
  titleAr: string;
  titleEn: string;
  category: ListingCategory;
  status: ListingStatus;
  cityAr: string;
  cityEn: string;
  areaAr: string;
  areaEn: string;
  priceLabelAr: string;
  priceLabelEn: string;
  measureLabel: string;
  image: string;
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
  name: string;
  role: "admin" | "customer";
};

export type AuthMode = "login" | "signup";
