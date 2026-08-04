import type { AuthorizedRequest } from "./contentApi";
import type { ListingMedia, ListingMediaRole } from "../types";

const SUPPORTED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
};

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_DURATION_MS = 2 * 60 * 60 * 1000;
const MAX_CONSECUTIVE_POLL_ERRORS = 5;

export class MediaProcessingFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaProcessingFailedError";
  }
}

export function mediaContentType(file: File) {
  const browserType = file.type.toLowerCase();
  if (SUPPORTED_CONTENT_TYPES.has(browserType)) return browserType;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPES[extension] ?? "";
}

function multipart(file: File) {
  const body = new FormData();
  const contentType = mediaContentType(file);
  const part = file.type.toLowerCase() === contentType ? file : file.slice(0, file.size, contentType);
  body.append("file", part, file.name);
  return body;
}

function aborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Upload monitoring was cancelled.", "AbortError");
}

function waitForNextPoll(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    aborted(signal);
    const onAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Upload monitoring was cancelled.", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, POLL_INTERVAL_MS);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function pollVideo(
  request: AuthorizedRequest,
  listingId: number,
  initial: ListingMedia,
  options: { signal?: AbortSignal; onMedia?: (media: ListingMedia) => void },
) {
  let current = initial;
  let consecutiveErrors = 0;
  const deadline = Date.now() + MAX_POLL_DURATION_MS;
  while (current.status !== "ready" && current.status !== "failed") {
    aborted(options.signal);
    if (Date.now() >= deadline) {
      throw new Error("انتهت مدة متابعة الفيديو. يمكنك إعادة المحاولة أو مراجعة حالته لاحقًا.");
    }
    await waitForNextPoll(options.signal);
    try {
      current = await request<ListingMedia>(`/api/v1/admin/listings/${listingId}/media/${initial.id}`, {
        signal: options.signal,
      });
      consecutiveErrors = 0;
      options.onMedia?.(current);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      consecutiveErrors += 1;
      if (consecutiveErrors >= MAX_CONSECUTIVE_POLL_ERRORS) throw error;
    }
  }
  if (current.status === "failed") {
    throw new MediaProcessingFailedError(current.failureReason || "فشلت معالجة الفيديو على الخادم.");
  }
  return current;
}

export const listingMediaApi = {
  async upload(
    request: AuthorizedRequest,
    listingId: number,
    file: File,
    role: ListingMediaRole,
    options: { signal?: AbortSignal; onMedia?: (media: ListingMedia) => void } = {},
  ) {
    aborted(options.signal);
    const path = role === "video"
      ? `/api/v1/admin/listings/${listingId}/media/videos`
      : `/api/v1/admin/listings/${listingId}/media/images/${role}`;
    const media = await request<ListingMedia>(path, {
      method: "POST",
      body: multipart(file),
      signal: options.signal,
    });
    options.onMedia?.(media);
    if (role !== "video" || media.status === "ready") return media;
    return pollVideo(request, listingId, media, options);
  },
  get: (request: AuthorizedRequest, listingId: number, mediaId: number, signal?: AbortSignal) =>
    request<ListingMedia>(`/api/v1/admin/listings/${listingId}/media/${mediaId}`, { signal }),
  delete: (request: AuthorizedRequest, listingId: number, mediaId: number) =>
    request<void>(`/api/v1/admin/listings/${listingId}/media/${mediaId}`, { method: "DELETE" }),
};
