import type { AboutContent, AppSettings, Listing, Sector } from "../types";

const CACHE_KEY = "elhabashy:public-content:v1";
const CACHE_VERSION = 1;
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

export type PublicContentSnapshot = {
  listings?: Listing[];
  sectors?: Sector[];
  settings?: AppSettings;
  about?: AboutContent;
};

type CacheEnvelope = {
  version: number;
  savedAt: number;
  data: PublicContentSnapshot;
};

function readEnvelope(): CacheEnvelope | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CacheEnvelope>;
    if (
      parsed.version !== CACHE_VERSION
      || typeof parsed.savedAt !== "number"
      || !parsed.data
      || Date.now() - parsed.savedAt > MAX_CACHE_AGE_MS
    ) {
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed as CacheEnvelope;
  } catch {
    return null;
  }
}

export function readPublicContentCache(): PublicContentSnapshot {
  return readEnvelope()?.data ?? {};
}

export function updatePublicContentCache(patch: PublicContentSnapshot) {
  if (typeof window === "undefined") return;
  try {
    const current = readEnvelope()?.data ?? {};
    const envelope: CacheEnvelope = {
      version: CACHE_VERSION,
      savedAt: Date.now(),
      data: { ...current, ...patch },
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage can be unavailable or full. Network data remains the source of truth.
  }
}
