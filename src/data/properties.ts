import type { AboutContent, AppSettings, Listing, Sector, Subscriber, User } from "../types";

export const initialSettings: AppSettings = {
  whatsappNumber: "201000000000",
  whatsappMessageAr: "أهلا، أحتاج تفاصيل المزاد الخاصة بـ {title}",
  whatsappMessageEn: "Hello, I need the auction details for {title}",
  whatsappMessageFr: "Bonjour, je souhaite recevoir les details de l'enchere {title}",
  contactPhone: "25789288 - 202 / 25780424 -202 / 25780425 -202",
  contactEmail: "info@elhabashy.com",
  officeAddress: {
    ar: "22 ش محمود بسيوني - قصر النيل - القاهرة",
    en: "22 Mahmoud Bassiouny St. - Kasr El Nil - Cairo",
    fr: "22 rue Mahmoud Bassiouny - Kasr El Nil - Le Caire",
  },
  mapUrl: "https://maps.google.com/?q=22%20Mahmoud%20Bassiouny%20St%20Kasr%20El%20Nil%20Cairo",
  facebookUrl: "https://www.facebook.com/elhabashy.auctionappraisal/",
  linkedinUrl: "",
};

export const initialSectors: Sector[] = [
  {
    id: "real-estate",
    title: { ar: "العقارات", en: "Real Estate", fr: "Immobilier" },
    description: {
      ar: "أراضي، وحدات، فيلات، ومبان جاهزة للمعاينة والتواصل.",
      en: "Land, units, villas, and buildings prepared for viewing and contact.",
      fr: "Terrains, unites, villas et batiments prets pour visite et contact.",
    },
  },
  {
    id: "movables",
    title: { ar: "العدد والمنقولات", en: "Movables", fr: "Biens mobiliers" },
    description: {
      ar: "معدات، مخزون، أجهزة، ومنقولات تشغيلية قابلة للفحص.",
      en: "Equipment, inventory, devices, and operational movables ready for inspection.",
      fr: "Equipements, stocks, appareils et biens mobiliers disponibles pour inspection.",
    },
  },
  {
    id: "cars",
    title: { ar: "السيارات", en: "Cars", fr: "Voitures" },
    description: {
      ar: "سيارات ملاكي، نقل، وأساطيل شركات مع بيانات واضحة.",
      en: "Passenger cars, transport vehicles, and company fleets with clear data.",
      fr: "Voitures, vehicules de transport et flottes avec donnees claires.",
    },
  },
  {
    id: "antiques",
    title: { ar: "التحف والأنتيكات", en: "Antiques", fr: "Antiquites" },
    description: {
      ar: "قطع فنية، ديكور، مقتنيات، ومجموعات كلاسيكية.",
      en: "Art pieces, decor, collectibles, and classic collections.",
      fr: "Objets d'art, decoration, collections et pieces classiques.",
    },
  },
  {
    id: "scrap",
    title: { ar: "المخلفات والسكراب", en: "Scrap", fr: "Lots industriels" },
    description: {
      ar: "مخلفات تشغيل، خردة، وسكراب صناعي حسب الوزن والمعاينة.",
      en: "Operational leftovers, scrap, and industrial lots by weight and inspection.",
      fr: "Lots industriels, rebuts et ferraille selon poids et inspection.",
    },
  },
  {
    id: "other",
    title: { ar: "أخرى", en: "Other", fr: "Autre" },
    description: {
      ar: "أي عروض أو أصول لا تدخل تحت القطاعات الأساسية.",
      en: "Any listings or assets outside the main sectors.",
      fr: "Toute offre ou actif hors des secteurs principaux.",
    },
  },
];

export const initialAboutContent: AboutContent = {
  profile: {
    ar: "بدأت نواة الشركة عام 1944 من مكتب شيخ الخبراء المثمنين سيد الحبشي، لتصبح شركة اتحاد الخبراء المثمنين واحدة من أقدم الجهات المتخصصة في الخبرة والتثمين والمزايدات في مصر. توسعت الخبرة لتشمل العقارات والمنقولات والسيارات والمخلفات والتحف والتحكيم وفض المنازعات.",
    en: "The company started in 1944 from the office of valuation expert Sayed El Habashy, growing into one of Egypt's long-standing valuation and auction practices. Its expertise covers real estate, movable assets, cars, scrap, antiques, arbitration, and dispute resolution.",
  },
  workCategories: [
    {
      id: 1,
      title: { ar: "البنوك", en: "Banks" },
      items: [
        { ar: "البنك الأهلي المصري", en: "National Bank of Egypt" },
        { ar: "بنك مصر", en: "Banque Misr" },
        { ar: "البنك التجاري الدولي CIB", en: "Commercial International Bank CIB" },
        { ar: "بنك فيصل الإسلامي", en: "Faisal Islamic Bank" },
      ],
    },
    {
      id: 2,
      title: { ar: "الوزارات والهيئات", en: "Ministries and Authorities" },
      items: [
        { ar: "وزارة الإسكان والمجتمعات العمرانية", en: "Ministry of Housing and Urban Communities" },
        { ar: "الهيئة القومية للإنتاج الحربي", en: "National Organization for Military Production" },
        { ar: "هيئة الأوقاف المصرية", en: "Egyptian Awqaf Authority" },
        { ar: "هيئة قناة السويس", en: "Suez Canal Authority" },
      ],
    },
    {
      id: 3,
      title: { ar: "الشركات والصناعات", en: "Companies and Industries" },
      items: [
        { ar: "النصر لصناعة السيارات", en: "El Nasr Automotive Manufacturing" },
        { ar: "أبو قير للأسمدة والصناعات الكيماوية", en: "Abu Qir Fertilizers and Chemical Industries" },
        { ar: "مصر للألومنيوم", en: "Egyptalum" },
        { ar: "مجموعة شركات أوليمبيك جروب", en: "Olympic Group" },
      ],
    },
    {
      id: 4,
      title: { ar: "المحافظات", en: "Governorates" },
      items: [
        { ar: "القاهرة", en: "Cairo" },
        { ar: "الجيزة", en: "Giza" },
        { ar: "الإسكندرية", en: "Alexandria" },
        { ar: "السويس", en: "Suez" },
      ],
    },
  ],
  certificates: [
    {
      id: 1,
      title: { ar: "شهادات تقدير وشراكات مهنية", en: "Recognition and Professional Partnerships" },
      date: "2015",
      description: {
        ar: "مساحة مخصصة لعرض شهادات التقدير، البروتوكولات، وصور الاعتمادات عند توافرها من الإدارة.",
        en: "A space for recognition certificates, protocols, and accreditation images when supplied by management.",
      },
    },
  ],
  structure: {
    leaders: [
      { ar: "سيد سيد الحبشي", en: "Sayed Sayed El Habashy" },
      { ar: "سعيد سيد الحبشي", en: "Saied Sayed El Habashy" },
      { ar: "محمد سيد الحبشي", en: "Mohamed Sayed El Habashy" },
      { ar: "مصطفى سيد سيد الحبشي", en: "Mostafa Sayed Sayed El Habashy" },
      { ar: "أحمد سعيد سيد الحبشي", en: "Ahmed Saied Sayed El Habashy" },
    ],
    departments: [
      { ar: "العقارات", en: "Real estate" },
      { ar: "العدد والمنقولات", en: "Movables and equipment" },
      { ar: "المخلفات", en: "Scrap and leftovers" },
      { ar: "التحف", en: "Antiques" },
      { ar: "الشؤون القانونية", en: "Legal affairs" },
      { ar: "العلاقات العامة", en: "Public relations" },
      { ar: "التأمين والمخاطر", en: "Insurance and risk" },
      { ar: "التمويل العقاري", en: "Mortgage finance" },
    ],
  },
};

export const initialListings: Listing[] = [
  {
    id: 1,
    slug: "new-cairo-private-villa",
    title: {
      ar: "فيلا مستقلة بحديقة خاصة في التجمع الخامس",
      en: "Standalone Villa With Private Garden in New Cairo",
    },
    summary: {
      ar: "أصل عقاري مميز داخل نطاق سكني راق مع صور ومعاينات واضحة.",
      en: "A premium residential asset with clear visuals and viewing-ready documentation.",
    },
    description: {
      ar: "<h2>فرصة عقارية جاهزة للمعاينة</h2><p>فيلا مستقلة بموقع هادئ داخل التجمع الخامس، مناسبة لمن يبحث عن أصل واضح البيانات وسهل الفحص.</p><ul><li>صور داخلية وخارجية واضحة</li><li>موقع قريب من الخدمات الرئيسية</li><li>تواصل مباشر مع الفريق لترتيب المعاينة</li></ul>",
      en: "<h2>Viewing-ready real estate opportunity</h2><p>A standalone villa in a quiet New Cairo location, prepared for customers who need clear data and organized inspection materials.</p><ul><li>Clear interior and exterior photos</li><li>Near key services and access roads</li><li>Direct team contact for viewing coordination</li></ul>",
    },
    category: "real-estate",
    status: "active",
    city: { ar: "القاهرة الجديدة", en: "New Cairo" },
    location: { ar: "التجمع الخامس - بالقرب من شارع التسعين", en: "Fifth Settlement - near South 90 Street" },
    priceLabel: { ar: "18.5 مليون جنيه", en: "EGP 18.5M" },
    measureLabel: "420 m²",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=84",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84",
    ],
    specs: [
      { label: { ar: "نوع الأصل", en: "Asset type" }, value: { ar: "فيلا", en: "Villa" } },
      { label: { ar: "المساحة", en: "Area" }, value: { ar: "420 م²", en: "420 m²" } },
      { label: { ar: "الموقع", en: "Location" }, value: { ar: "التجمع الخامس", en: "Fifth Settlement" } },
    ],
    createdAt: "2026-05-20",
    publishDate: "2026-06-11",
    expireDate: "2026-06-29",
    auctionDate: "2026-06-29",
    auctionTime: "12:00",
    beneficiary: {
      ar: "لصالح كبرى شركات التمويل العقاري",
      en: "For a major real estate finance company",
    },
    venue: {
      ar: "أمام جنينه مول - مدينة نصر",
      en: "In front of Genena Mall - Nasr City",
    },
    announcementSource: {
      ar: "الأخبار",
      en: "Al Akhbar",
    },
    notes: {
      ar: "كافة التفاصيل والتأمين يتم تأكيدها من خلال فريق التواصل الرسمي.",
      en: "Full details and deposits are confirmed through the official contact team.",
    },
    mapUrl: "https://maps.google.com/?q=Genena%20Mall%20Nasr%20City%20Cairo",
    views: 2840,
    whatsappClicks: 88,
  },
  {
    id: 2,
    slug: "company-car-fleet",
    title: {
      ar: "مجموعة سيارات شركة بحالة تشغيل جيدة",
      en: "Company Car Fleet in Good Running Condition",
    },
    summary: {
      ar: "أسطول سيارات ملاكي ونقل خفيف مع بيانات حالة وصور تفصيلية.",
      en: "Passenger and light transport fleet with condition notes and detailed photos.",
    },
    description: {
      ar: "<h2>أسطول جاهز للفحص</h2><p>مجموعة سيارات تشغيلية مناسبة للشركات والتجار، مع إمكانية التواصل للحصول على القائمة التفصيلية.</p><blockquote>المعاينة متاحة حسب الموعد.</blockquote>",
      en: "<h2>Inspection-ready fleet</h2><p>A running company fleet suitable for traders and operators, with a detailed vehicle list available through direct contact.</p><blockquote>Viewing by appointment.</blockquote>",
    },
    category: "cars",
    status: "active",
    city: { ar: "مدينة نصر", en: "Nasr City" },
    location: { ar: "المنطقة الصناعية - مخزن الشركة", en: "Industrial Zone - company yard" },
    priceLabel: { ar: "حسب كل سيارة", en: "Per vehicle" },
    measureLabel: "12 vehicles",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=84",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=84",
    ],
    specs: [
      { label: { ar: "العدد", en: "Count" }, value: { ar: "12 سيارة", en: "12 vehicles" } },
      { label: { ar: "الحالة", en: "Condition" }, value: { ar: "تشغيل جيد", en: "Good running" } },
      { label: { ar: "المعاينة", en: "Viewing" }, value: { ar: "بالحجز", en: "By appointment" } },
    ],
    createdAt: "2026-05-18",
    publishDate: "2026-05-31",
    expireDate: "2026-06-17",
    auctionDate: "2026-06-17",
    auctionTime: "12:00",
    beneficiary: {
      ar: "لصالح إحدى كبرى البنوك",
      en: "For a major bank",
    },
    venue: {
      ar: "مكان المعاينة يحدد بالتواصل",
      en: "Viewing venue is confirmed by contact",
    },
    announcementSource: {
      ar: "الأخبار",
      en: "Al Akhbar",
    },
    notes: {
      ar: "السيارات بحالة جيدة وموديلات حتى 2021.",
      en: "Vehicles are in good condition, models up to 2021.",
    },
    views: 1975,
    whatsappClicks: 61,
  },
  {
    id: 3,
    slug: "classic-antiques-collection",
    title: {
      ar: "مجموعة أنتيكات وتحف كلاسيكية",
      en: "Classic Antiques and Collectibles Collection",
    },
    summary: {
      ar: "مجموعة قطع ديكور ونحاسيات وأثاث كلاسيكي للمهتمين بالمقتنيات.",
      en: "Decor pieces, brass items, and classic furniture for collectors.",
    },
    description: {
      ar: "<h2>مجموعة مختارة بعناية</h2><p>تضم المجموعة قطعا متنوعة قابلة للمعاينة، مع صور تفصيلية لكل مجموعة فرعية.</p><ul><li>قطع ديكور</li><li>نحاسيات</li><li>أثاث كلاسيكي</li></ul>",
      en: "<h2>Carefully selected collection</h2><p>The collection includes multiple inspectable pieces with detailed photos for each group.</p><ul><li>Decor pieces</li><li>Brass items</li><li>Classic furniture</li></ul>",
    },
    category: "antiques",
    status: "coming-soon",
    city: { ar: "الإسكندرية", en: "Alexandria" },
    location: { ar: "محطة الرمل - المعاينة بالحجز", en: "Raml Station - viewing by appointment" },
    priceLabel: { ar: "تسعير حسب القطعة", en: "Priced per item" },
    measureLabel: "34 pieces",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=84",
      "https://images.unsplash.com/photo-1603204077779-bed963ea7d0e?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=84",
    ],
    specs: [
      { label: { ar: "العدد", en: "Count" }, value: { ar: "34 قطعة", en: "34 pieces" } },
      { label: { ar: "الفئة", en: "Class" }, value: { ar: "تحف وأنتيكات", en: "Antiques" } },
      { label: { ar: "البيع", en: "Pricing" }, value: { ar: "حسب القطعة", en: "Per item" } },
    ],
    createdAt: "2026-05-15",
    views: 1432,
    whatsappClicks: 31,
  },
  {
    id: 4,
    slug: "factory-metal-scrap",
    title: {
      ar: "مخلفات معدنية وسكراب من مصنع",
      en: "Factory Metal Scrap and Industrial Leftovers",
    },
    summary: {
      ar: "مخلفات تشغيل معدنية مصنفة مناسبة للتجار والمصانع.",
      en: "Sorted metal leftovers suitable for traders and industrial operators.",
    },
    description: {
      ar: "<h2>مخلفات صناعية مصنفة</h2><p>الكميات متاحة للفحص بالموقع، ويتم التعامل حسب الوزن والمعاينة النهائية.</p>",
      en: "<h2>Sorted industrial leftovers</h2><p>Quantities are available for site inspection and handled according to weight and final viewing.</p>",
    },
    category: "scrap",
    status: "active",
    city: { ar: "العاشر من رمضان", en: "10th of Ramadan" },
    location: { ar: "منطقة المصانع - داخل موقع المصنع", en: "Factories District - inside factory site" },
    priceLabel: { ar: "حسب الوزن والمعاينة", en: "By weight and inspection" },
    measureLabel: "48 tons",
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=84",
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1581093458791-9d15482778a1?auto=format&fit=crop&w=1200&q=84",
    ],
    specs: [
      { label: { ar: "الكمية", en: "Quantity" }, value: { ar: "48 طن", en: "48 tons" } },
      { label: { ar: "النوع", en: "Type" }, value: { ar: "معادن", en: "Metals" } },
      { label: { ar: "التسعير", en: "Pricing" }, value: { ar: "بالوزن", en: "By weight" } },
    ],
    createdAt: "2026-05-10",
    views: 1090,
    whatsappClicks: 24,
  },
  {
    id: 5,
    slug: "october-residential-land",
    title: {
      ar: "قطعة أرض سكنية في 6 أكتوبر",
      en: "Residential Land Plot in 6th of October",
    },
    summary: {
      ar: "قطعة أرض سكنية محفوظة بالأرشيف لعرض البيانات والشفافية.",
      en: "Residential land record kept visible for transparency and reference.",
    },
    description: {
      ar: "<p>عرض مغلق محفوظ في الأرشيف مع بيانات الموقع والمستندات الأساسية.</p>",
      en: "<p>Closed listing kept in the archive with location data and basic documents.</p>",
    },
    category: "real-estate",
    status: "closed",
    city: { ar: "6 أكتوبر", en: "6th of October" },
    location: { ar: "التوسعات الشمالية", en: "Northern Expansions" },
    priceLabel: { ar: "مغلق", en: "Closed" },
    measureLabel: "600 m²",
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=84",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=84",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=84",
    ],
    specs: [
      { label: { ar: "المساحة", en: "Area" }, value: { ar: "600 م²", en: "600 m²" } },
      { label: { ar: "الحالة", en: "Status" }, value: { ar: "مغلق", en: "Closed" } },
    ],
    createdAt: "2026-04-28",
    views: 722,
    whatsappClicks: 10,
  },
];

export const initialSubscribers: Subscriber[] = [
  {
    id: 1,
    name: "كريم علي",
    whatsapp: "+201066600000",
    email: "karim@example.com",
    city: "New Cairo",
    category: "real-estate",
    budget: "12M - 20M",
  },
  {
    id: 2,
    name: "Mona Adel",
    whatsapp: "+201099911122",
    email: "mona@example.com",
    city: "Nasr City",
    category: "cars",
    budget: "2M - 6M",
  },
];

export const initialUsers: User[] = [
  { id: 1, name: "El Habashy Admin", email: "admin@elhabashy.com", role: "admin", favorites: [] },
  { id: 2, name: "Mona Adel", email: "mona@example.com", role: "customer", favorites: [1, 2] },
];
