import type { AboutContent, AppSettings, Sector } from "../types";

export const initialSettings: AppSettings = {
  whatsappNumber: "201000000000",
  whatsappMessageAr: "أهلا، أحتاج تفاصيل المزاد الخاصة بـ {title}",
  whatsappMessageEn: "Hello, I need the auction details for {title}",
  contactPhone: "25789288 - 202 / 25780424 -202 / 25780425 -202",
  contactEmail: "info@elhabashy.com",
  officeAddress: {
    ar: "22 ش محمود بسيوني - قصر النيل - القاهرة",
    en: "22 Mahmoud Bassiouny St. - Kasr El Nil - Cairo",
  },
  mapUrl: "https://maps.google.com/?q=22%20Mahmoud%20Bassiouny%20St%20Kasr%20El%20Nil%20Cairo",
  facebookUrl: "https://www.facebook.com/elhabashy.auctionappraisal/",
  linkedinUrl: "https://www.linkedin.com/company/elhabashy/",
};

export const initialSectors: Sector[] = [
  {
    id: "real-estate",
    title: { ar: "العقارات", en: "Real Estate" },
    description: {
      ar: "أراضي، وحدات، فيلات، ومبان جاهزة للمعاينة والتواصل.",
      en: "Land, units, villas, and buildings prepared for viewing and contact.",
    },
  },
  {
    id: "movables",
    title: { ar: "العدد والمنقولات", en: "Movables" },
    description: {
      ar: "معدات، مخزون، أجهزة، ومنقولات تشغيلية قابلة للفحص.",
      en: "Equipment, inventory, devices, and operational movables ready for inspection.",
    },
  },
  {
    id: "cars",
    title: { ar: "السيارات", en: "Cars" },
    description: {
      ar: "سيارات ملاكي، نقل، وأساطيل شركات مع بيانات واضحة.",
      en: "Passenger cars, transport vehicles, and company fleets with clear data.",
    },
  },
  {
    id: "antiques",
    title: { ar: "التحف والأنتيكات", en: "Antiques" },
    description: {
      ar: "قطع فنية، ديكور، مقتنيات، ومجموعات كلاسيكية.",
      en: "Art pieces, decor, collectibles, and classic collections.",
    },
  },
  {
    id: "scrap",
    title: { ar: "المخلفات والسكراب", en: "Scrap" },
    description: {
      ar: "مخلفات تشغيل، خردة، وسكراب صناعي حسب الوزن والمعاينة.",
      en: "Operational leftovers, scrap, and industrial lots by weight and inspection.",
    },
  },
  {
    id: "other",
    title: { ar: "أخرى", en: "Other" },
    description: {
      ar: "أي عروض أو أصول لا تدخل تحت القطاعات الأساسية.",
      en: "Any listings or assets outside the main sectors.",
    },
  },
];

export const initialAboutContent: AboutContent = {
  profile: {
    headline: { ar: "خبرة ممتدة في التثمين وإدارة المزادات منذ عام 1944", en: "Valuation and auction expertise since 1944" },
    profile: {
      ar: "الحبشي للخبراء المثمنين للخبرة والتثمين، خبرة مصرية ممتدة في تقييم الأصول وإدارة المزادات والخبرة الفنية.",
      en: "El Habashy Valuation Experts for Expertise and Appraisal is a long-established Egyptian practice in asset valuation, auctions and technical expertise.",
    },
    mission: { ar: "تقديم تقييمات وخبرات فنية مستقلة وإدارة المزادات بصورة منظمة وشفافة.", en: "To deliver independent valuation and technical expertise through transparent, organized processes." },
    vision: { ar: "أن تظل الحبشي مرجعًا موثوقًا للخبرة والتثمين في مصر.", en: "To remain a trusted Egyptian reference for expertise and appraisal." },
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
    startedYear: 1944,
  },
  people: [],
  departments: [],
  workCategories: [],
  certificates: [],
};
