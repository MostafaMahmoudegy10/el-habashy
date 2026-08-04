import type { AuthorizedRequest } from "./contentApi";
import type { ListingMedia, ListingMediaRole } from "../types";

export type MediaUploadStage = "ticket" | "uploading" | "completing";

export type MediaUploadTicket = {
  media: ListingMedia;
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
  resourceType: "image" | "video";
  chunkSize: number;
  expiresAt: string;
};

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

export function mediaContentType(file: File) {
  const browserType = file.type.toLowerCase();
  if (SUPPORTED_CONTENT_TYPES.has(browserType)) return browserType;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPES[extension] ?? "";
}

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  version?: number;
  signature?: string;
  done?: boolean;
  error?: { message?: string };
};

function xhrUpload(
  url: string,
  body: FormData,
  headers: Record<string, string>,
  onProgress: (loaded: number) => void,
) {
  return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    Object.entries(headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };
    request.onerror = () => reject(new Error("تعذر الاتصال بخدمة رفع الملفات."));
    request.onabort = () => reject(new Error("تم إلغاء رفع الملف."));
    request.onload = () => {
      let response: CloudinaryUploadResponse;
      try {
        response = JSON.parse(request.responseText || "{}") as CloudinaryUploadResponse;
      } catch {
        reject(new Error("خدمة رفع الملفات أعادت استجابة غير صالحة."));
        return;
      }
      if (request.status < 200 || request.status >= 300 || response.error) {
        reject(new Error(response.error?.message || `فشل رفع الملف (${request.status}).`));
        return;
      }
      resolve(response);
    };
    request.send(body);
  });
}

function signedForm(ticket: MediaUploadTicket, file: Blob, fileName: string) {
  const body = new FormData();
  body.append("file", file, fileName);
  body.append("api_key", ticket.apiKey);
  body.append("timestamp", String(ticket.timestamp));
  body.append("signature", ticket.signature);
  body.append("public_id", ticket.publicId);
  return body;
}

function uploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function uploadToCloudinary(
  ticket: MediaUploadTicket,
  file: File,
  onProgress: (progress: number) => void,
) {
  const contentType = mediaContentType(file);
  if (ticket.resourceType === "image") {
    const uploadFile = file.type === contentType ? file : file.slice(0, file.size, contentType);
    const response = await xhrUpload(
      ticket.uploadUrl,
      signedForm(ticket, uploadFile, file.name),
      {},
      (loaded) => onProgress(Math.min(100, Math.round((loaded / file.size) * 100))),
    );
    onProgress(100);
    return response;
  }

  const stableUploadId = uploadId();
  const chunkSize = Math.max(1, ticket.chunkSize);
  let finalResponse: CloudinaryUploadResponse = {};
  for (let start = 0; start < file.size; start += chunkSize) {
    const endExclusive = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, endExclusive, contentType);
    finalResponse = await xhrUpload(
      ticket.uploadUrl,
      signedForm(ticket, chunk, file.name),
      {
        "X-Unique-Upload-Id": stableUploadId,
        "Content-Range": `bytes ${start}-${endExclusive - 1}/${file.size}`,
      },
      (loaded) => onProgress(Math.min(100, Math.round(((start + loaded) / file.size) * 100))),
    );
    onProgress(Math.min(100, Math.round((endExclusive / file.size) * 100)));
  }
  return finalResponse;
}

function completionBody(response: CloudinaryUploadResponse) {
  if (
    response.done === false
    || !response.secure_url
    || !response.public_id
    || !response.resource_type
    || !response.format
    || !response.bytes
    || !response.version
    || !response.signature
  ) {
    throw new Error("استجابة Cloudinary النهائية غير مكتملة.");
  }
  return {
    secureUrl: response.secure_url,
    publicId: response.public_id,
    resourceType: response.resource_type,
    format: response.format,
    width: response.width,
    height: response.height,
    bytes: response.bytes,
    duration: response.duration,
    version: response.version,
    signature: response.signature,
  };
}

function failureReason(error: unknown) {
  const message = error instanceof Error ? error.message : "فشل رفع الملف.";
  return message.slice(0, 500);
}

export const listingMediaApi = {
  async upload(
    request: AuthorizedRequest,
    listingId: number,
    file: File,
    role: ListingMediaRole,
    callbacks: {
      onStage?: (stage: MediaUploadStage, media?: ListingMedia) => void;
      onProgress?: (progress: number) => void;
    } = {},
  ) {
    let ticket: MediaUploadTicket | undefined;
    try {
      callbacks.onStage?.("ticket");
      ticket = await request<MediaUploadTicket>(`/api/v1/admin/listings/${listingId}/media/uploads`, {
        method: "POST",
        body: { fileName: file.name, contentType: mediaContentType(file), bytes: file.size, role },
      });
      callbacks.onStage?.("uploading", ticket.media);
      const cloudinary = await uploadToCloudinary(ticket, file, (progress) => callbacks.onProgress?.(progress));
      callbacks.onStage?.("completing", ticket.media);
      return await request<ListingMedia>(
        `/api/v1/admin/listings/${listingId}/media/${ticket.media.id}/complete`,
        { method: "POST", body: completionBody(cloudinary) },
      );
    } catch (error) {
      if (ticket) {
        try {
          await request<ListingMedia>(`/api/v1/admin/listings/${listingId}/media/${ticket.media.id}/fail`, {
            method: "POST",
            body: { reason: failureReason(error) },
          });
        } catch {
          // Best effort: preserve the original upload error for the UI.
        }
      }
      throw error;
    }
  },
  delete: (request: AuthorizedRequest, listingId: number, mediaId: number) =>
    request<void>(`/api/v1/admin/listings/${listingId}/media/${mediaId}`, { method: "DELETE" }),
};
