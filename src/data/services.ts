import type { ServiceArticle } from "../types";

export const initialServices: ServiceArticle[] = [
  {
    id: 1,
    kind: "valuation",
    title: { ar: "قسم التقييمات والتقارير ودراسات الجدوى", en: "Valuation, Reports & Feasibility Studies", fr: "Évaluation et études de faisabilité" },
    summary: { ar: "خبراء عقاريون واستشاريون ومحللون اقتصاديون لتقييم الأصول والمشروعات بأحدث المناهج العالمية.", en: "Specialists in asset valuation, reporting and real-estate feasibility studies.", fr: "Spécialistes de l'évaluation des actifs et des études de faisabilité." },
    content: {
      ar: "<h2>قسم التقييمات والتقارير ودراسات الجدوى</h2><p>يضم القسم كوكبة من <strong>الخبراء العقاريين والاستشاريين والمحللين الاقتصاديين</strong> لتقييم الأراضي والأصول العقارية والمشروعات والمنشآت الصناعية والزراعية بواسطة أحدث مناهج التقييم العقاري المعمول بها في العالم؛ لضمان تأسيس القيمة بمنظور علمي وعملي يساير الواقع الفعلي والمناخ السائد بالبيئة الاقتصادية الكائن بها الأصل طبقًا لآليات السوق، والمحافظة على القيمة الاقتصادية والاستثمارية للأصول.</p><h3>يتخصص القسم في:</h3><ul><li>تقييم الأراضي الفضاء بأنواعها.</li><li>تقييم المراكز التجارية.</li><li>تقييم المشروعات الصناعية والزراعية بأنواعها.</li><li>تقييم المعدات والآلات والسيارات.</li><li>إعداد دراسات الجدوى العقارية للمشروعات.</li><li>تقييم التحف والأنتيكات.</li></ul><p>وذلك من خلال أقسام داخلية متخصصة، كلٌ في مجاله.</p>",
      en: "<h2>Valuation, Reports & Feasibility Studies</h2><p>Our real-estate experts, consultants and economic analysts value land, property assets, industrial and agricultural projects using internationally recognized methodologies.</p><ul><li>Land and commercial centers</li><li>Industrial and agricultural projects</li><li>Equipment, machinery and vehicles</li><li>Real-estate feasibility studies</li><li>Antiques and collectibles</li></ul>",
      fr: "<h2>Évaluation et études de faisabilité</h2><p>Une équipe spécialisée évalue les terrains, les actifs et les projets selon des méthodes reconnues.</p>"
    },
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85",
    gallery: [],
    featured: true,
    createdAt: "2026-07-22"
  },
  {
    id: 2, kind: "arbitration", title: { ar: "القطاع العقاري", en: "Real Estate Arbitration", fr: "Arbitrage immobilier" },
    summary: { ar: "خبرة فنية وقانونية في المنازعات والتقديرات المرتبطة بالأصول العقارية.", en: "Technical expertise for real-estate disputes and asset assessments.", fr: "Expertise technique pour les litiges immobiliers." },
    content: { ar: "<h2>القطاع العقاري</h2><p>خدمات التحكيم والخبرة الفنية في المنازعات العقارية، وفحص المستندات والتقييمات وإعداد الرأي الفني المتخصص.</p>", en: "<h2>Real Estate Arbitration</h2><p>Technical review, document examination and specialist opinions for property disputes.</p>", fr: "<p>Expertise et arbitrage immobilier.</p>" },
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1600&q=85", gallery: [], featured: true, createdAt: "2026-07-21"
  },
  {
    id: 3, kind: "consulting", title: { ar: "الاستشارات الفنية والاقتصادية", en: "Technical & Economic Consulting", fr: "Conseil technique" },
    summary: { ar: "استشارات موثوقة لاتخاذ قرارات استثمارية مبنية على البيانات والخبرة.", en: "Evidence-led advice for sound investment decisions.", fr: "Conseils fondés sur les données." },
    content: { ar: "<h2>الاستشارات</h2><p>نقدم الرأي الفني والاقتصادي ودعم اتخاذ القرار للمؤسسات والمستثمرين في مختلف قطاعات الأصول.</p>", en: "<h2>Consulting</h2><p>Technical and economic advice for institutions and investors across asset sectors.</p>", fr: "<p>Conseil technique et économique.</p>" },
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85", gallery: [], featured: true, createdAt: "2026-07-20"
  },
  {
    id: 4, kind: "arbitration", title: { ar: "المنقولات والسيارات", en: "Movables & Vehicles", fr: "Biens mobiliers" },
    summary: { ar: "الخبرة والتحكيم في تقييم المنقولات والمعدات والمركبات.", en: "Arbitration expertise for movables, equipment and vehicles.", fr: "Expertise des biens mobiliers." },
    content: { ar: "<h2>المنقولات والسيارات</h2><p>فحص وتقييم المنقولات والمعدات والآلات والسيارات وإعداد التقارير الفنية المتخصصة.</p>", en: "<h2>Movables & Vehicles</h2><p>Technical inspection, valuation and specialist reports.</p>", fr: "<p>Expertise technique.</p>" },
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=85", gallery: [], featured: false, createdAt: "2026-07-19"
  },
  {
    id: 5, kind: "arbitration", title: { ar: "التحف والأنتيكات", en: "Antiques & Collectibles", fr: "Antiquités" },
    summary: { ar: "تقييم وفحص التحف والمقتنيات والأنتيكات بمعرفة خبراء متخصصين.", en: "Specialist appraisal of antiques and collectibles.", fr: "Évaluation des antiquités." },
    content: { ar: "<h2>التحف والأنتيكات</h2><p>الخبرة الفنية والتقييم والتحكيم في التحف والمقتنيات النادرة والأنتيكات.</p>", en: "<h2>Antiques & Collectibles</h2><p>Specialist appraisal and arbitration.</p>", fr: "<p>Évaluation spécialisée.</p>" },
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85", gallery: [], featured: false, createdAt: "2026-07-18"
  },
  {
    id: 6, kind: "arbitration", title: { ar: "الخيول العربية", en: "Arabian Horses", fr: "Chevaux arabes" },
    summary: { ar: "خبرة متخصصة في تقييم الخيول العربية والأصول المرتبطة بها.", en: "Specialist expertise in Arabian horse valuation.", fr: "Expertise des chevaux arabes." },
    content: { ar: "<h2>الخيول العربية</h2><p>تقييم وفحص الخيول العربية وإعداد الرأي الفني والتقارير المتخصصة.</p>", en: "<h2>Arabian Horses</h2><p>Valuation, inspection and specialist reporting.</p>", fr: "<p>Évaluation spécialisée.</p>" },
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1600&q=85", gallery: [], featured: false, createdAt: "2026-07-17"
  }
];
