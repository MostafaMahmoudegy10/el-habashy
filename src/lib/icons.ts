import {
  FaBuilding,
  FaCarSide,
  FaGem,
  FaRecycle,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { ListingCategory } from "../types";

export const categoryIcon: Record<ListingCategory, IconType> = {
  "real-estate": FaBuilding,
  cars: FaCarSide,
  antiques: FaGem,
  scrap: FaRecycle,
};
