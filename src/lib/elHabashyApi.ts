import { adminApi, authApi } from "./authApi";
import { adminContentApi, publicContentApi } from "./contentApi";
import { listingMediaApi } from "./listingMediaApi";

/**
 * The single frontend gateway for every El Habashy backend endpoint.
 * Keep feature code behind these grouped clients so base URLs, cookies,
 * authorization refreshes, and request formats stay consistent.
 */
export const elHabashyApi = {
  auth: authApi,
  public: publicContentApi,
  admin: {
    users: adminApi,
    content: adminContentApi,
    media: listingMediaApi,
  },
} as const;

export type {
  AppSettingsResponse,
  AuthorizedRequest,
  ListingEngagementResponse,
  ListingQuery,
  ListingResponse,
  ListingSubmissionMedia,
  SectorResponse,
  UpsertListingBody,
} from "./contentApi";
export type {
  AuthResponse,
  AuthUser,
  MessageResponse,
  PageResponse,
  RegistrationResponse,
  UserRole,
} from "./authApi";
