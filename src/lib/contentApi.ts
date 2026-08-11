import { apiRequest } from "./api";
import type { PageResponse } from "./authApi";
import type {
  Listing,
  ListingCategory,
  ListingStatus,
  LocalizedText,
  Sector,
  Specification,
  AppSettings,
  AboutContent,
  AboutProfile,
  AboutPerson,
  AboutDepartment,
  Certificate,
  WorkCategory,
  WorkEntry,
} from "../types";

export type SectorResponse = {
  code: string;
  displayOrder: number;
  title: LocalizedText;
  description: LocalizedText;
  updatedAt: string;
};

export type ListingResponse = Omit<Listing, "category"> & {
  category: string;
  updatedAt: string;
};

export type ListingQuery = {
  category?: ListingCategory;
  status?: ListingStatus;
  featured?: boolean;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type ListingEngagementResponse = {
  listingId: number;
  slug: string;
  views: number;
  whatsappClicks: number;
};

export type AppSettingsResponse = AppSettings & {
  updatedAt: string;
};

export type AboutImageResponse = {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
};

export type UpdateAboutProfileBody = Omit<AboutProfile, "updatedAt">;
export type UpsertAboutPersonBody = Omit<AboutPerson, "id" | "updatedAt">;
export type UpsertAboutDepartmentBody = Omit<AboutDepartment, "id" | "updatedAt">;
export type UpsertCertificateBody = Omit<Certificate, "id" | "updatedAt">;
export type UpsertWorkCategoryBody = Omit<WorkCategory, "id" | "entries" | "updatedAt">;
export type UpsertWorkEntryBody = Omit<WorkEntry, "id" | "categoryId" | "updatedAt">;

export type UpsertListingBody = {
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
  specs: Specification[];
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
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
  seoKeywords?: LocalizedText;
};

export type ListingSubmissionMedia = {
  thumbnail: File;
  gallery: File[];
  video?: File;
};

function queryString(query: ListingQuery = {}) {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") parameters.set(key, String(value));
  });
  const value = parameters.toString();
  return value ? `?${value}` : "";
}

export const publicContentApi = {
  sectors: () => apiRequest<SectorResponse[]>("/api/v1/public/sectors"),
  listings: (query: ListingQuery = {}) =>
    apiRequest<PageResponse<ListingResponse>>(`/api/v1/public/listings${queryString(query)}`),
  listing: (slug: string) =>
    apiRequest<ListingResponse>(`/api/v1/public/listings/${encodeURIComponent(slug)}`),
  trackWhatsappClick: (slug: string) =>
    apiRequest<ListingEngagementResponse>(
      `/api/v1/public/listings/${encodeURIComponent(slug)}/whatsapp-click`,
      { method: "POST" },
    ),
  settings: () => apiRequest<AppSettingsResponse>("/api/v1/public/settings"),
  about: () => apiRequest<AboutContent>("/api/v1/public/about"),
};

export type AuthorizedRequest = <T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
) => Promise<T>;

export const adminContentApi = {
  listings: (request: AuthorizedRequest, query: ListingQuery = {}) =>
    request<PageResponse<ListingResponse>>(`/api/v1/admin/listings${queryString(query)}`),
  createListing: (
    request: AuthorizedRequest,
    body: UpsertListingBody,
    media: ListingSubmissionMedia,
  ) => {
    const multipart = new FormData();
    multipart.append(
      "listing",
      new Blob([JSON.stringify(body)], { type: "application/json" }),
      "listing.json",
    );
    multipart.append("thumbnail", media.thumbnail, media.thumbnail.name);
    media.gallery.forEach((image) => multipart.append("gallery", image, image.name));
    if (media.video) multipart.append("video", media.video, media.video.name);
    return request<ListingResponse>("/api/v1/admin/listings", { method: "POST", body: multipart });
  },
  updateListing: (request: AuthorizedRequest, id: number, body: UpsertListingBody) =>
    request<ListingResponse>(`/api/v1/admin/listings/${id}`, { method: "PUT", body }),
  updateListingStatus: (request: AuthorizedRequest, id: number, status: ListingStatus) =>
    request<ListingResponse>(`/api/v1/admin/listings/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  deleteListing: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/listings/${id}`, { method: "DELETE" }),
  updateSector: (
    request: AuthorizedRequest,
    code: ListingCategory,
    sector: Pick<Sector, "title" | "description">,
  ) => request<SectorResponse>(`/api/v1/admin/sectors/${code}`, { method: "PATCH", body: sector }),
  settings: (request: AuthorizedRequest) =>
    request<AppSettingsResponse>("/api/v1/admin/settings"),
  updateSettings: (request: AuthorizedRequest, settings: AppSettings) =>
    request<AppSettingsResponse>("/api/v1/admin/settings", {
      method: "PUT",
      body: settings,
    }),
  about: (request: AuthorizedRequest) => request<AboutContent>("/api/v1/admin/about"),
  updateAboutProfile: (request: AuthorizedRequest, body: UpdateAboutProfileBody) =>
    request<AboutProfile>("/api/v1/admin/about/profile", { method: "PUT", body }),
  createAboutPerson: (request: AuthorizedRequest, body: UpsertAboutPersonBody) =>
    request<AboutPerson>("/api/v1/admin/about/people", { method: "POST", body }),
  updateAboutPerson: (request: AuthorizedRequest, id: number, body: UpsertAboutPersonBody) =>
    request<AboutPerson>(`/api/v1/admin/about/people/${id}`, { method: "PUT", body }),
  deleteAboutPerson: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/about/people/${id}`, { method: "DELETE" }),
  createAboutDepartment: (request: AuthorizedRequest, body: UpsertAboutDepartmentBody) =>
    request<AboutDepartment>("/api/v1/admin/about/departments", { method: "POST", body }),
  updateAboutDepartment: (request: AuthorizedRequest, id: number, body: UpsertAboutDepartmentBody) =>
    request<AboutDepartment>(`/api/v1/admin/about/departments/${id}`, { method: "PUT", body }),
  deleteAboutDepartment: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/about/departments/${id}`, { method: "DELETE" }),
  createAboutCertificate: (request: AuthorizedRequest, body: UpsertCertificateBody) =>
    request<Certificate>("/api/v1/admin/about/certificates", { method: "POST", body }),
  updateAboutCertificate: (request: AuthorizedRequest, id: number, body: UpsertCertificateBody) =>
    request<Certificate>(`/api/v1/admin/about/certificates/${id}`, { method: "PUT", body }),
  deleteAboutCertificate: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/about/certificates/${id}`, { method: "DELETE" }),
  createAboutWorkCategory: (request: AuthorizedRequest, body: UpsertWorkCategoryBody) =>
    request<WorkCategory>("/api/v1/admin/about/work-categories", { method: "POST", body }),
  updateAboutWorkCategory: (request: AuthorizedRequest, id: number, body: UpsertWorkCategoryBody) =>
    request<WorkCategory>(`/api/v1/admin/about/work-categories/${id}`, { method: "PUT", body }),
  deleteAboutWorkCategory: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/about/work-categories/${id}`, { method: "DELETE" }),
  createAboutWorkEntry: (
    request: AuthorizedRequest,
    categoryId: number,
    body: UpsertWorkEntryBody,
  ) => request<WorkEntry>(`/api/v1/admin/about/work-categories/${categoryId}/entries`, { method: "POST", body }),
  updateAboutWorkEntry: (request: AuthorizedRequest, id: number, body: UpsertWorkEntryBody) =>
    request<WorkEntry>(`/api/v1/admin/about/work-entries/${id}`, { method: "PUT", body }),
  deleteAboutWorkEntry: (request: AuthorizedRequest, id: number) =>
    request<void>(`/api/v1/admin/about/work-entries/${id}`, { method: "DELETE" }),
  uploadAboutImage: (request: AuthorizedRequest, file: File) => {
    const multipart = new FormData();
    multipart.append("file", file, file.name);
    return request<AboutImageResponse>("/api/v1/admin/about/media", { method: "POST", body: multipart });
  },
};
