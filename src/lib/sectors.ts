import { categoryLabel } from "./i18n";
import type { Language, ListingCategory, Sector } from "../types";

export function getSector(sectors: Sector[], category: ListingCategory): Sector | undefined {
  return sectors.find((sector) => sector.id === category);
}

export function getSectorTitle(sectors: Sector[], category: ListingCategory, lang: Language) {
  return getSector(sectors, category)?.title[lang] || categoryLabel[category][lang];
}

export function getSectorDescription(sectors: Sector[], category: ListingCategory, lang: Language) {
  return getSector(sectors, category)?.description[lang] || "";
}
