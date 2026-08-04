import { apiRequest } from "./api";
import type { PageResponse } from "./authApi";
import type {
  Listing,
  ListingCategory,
  ListingStatus,
  LocalizedText,
  Sector,
  Specification,
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
};

export type AuthorizedRequest = <T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
) => Promise<T>;

export const adminContentApi = {
  listings: (request: AuthorizedRequest, query: ListingQuery = {}) =>
    request<PageResponse<ListingResponse>>(`/api/v1/admin/listings${queryString(query)}`),
  createListing: (request: AuthorizedRequest, body: UpsertListingBody) =>
    request<ListingResponse>("/api/v1/admin/listings", { method: "POST", body }),
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
};
