import {
  FaBuilding,
  FaCarSide,
  FaCircleQuestion,
  FaGem,
  FaRecycle,
} from "react-icons/fa6";
import { FiPackage } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { ListingCategory } from "../types";

export const categoryIcon: Record<ListingCategory, IconType> = {
  "real-estate": FaBuilding,
  movables: FiPackage,
  cars: FaCarSide,
  antiques: FaGem,
  scrap: FaRecycle,
  other: FaCircleQuestion,
};
