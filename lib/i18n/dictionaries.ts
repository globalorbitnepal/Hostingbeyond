import type { LanguageCode } from "@/config/geo";

export type Dictionary = {
  nav: {
    domains: string;
    businessEmail: string;
    hosting: string;
    resources: string;
    login: string;
    getStarted: string;
    pricing: string;
    beyondAi: string;
    contact: string;
    about: string;
    solutions: string;
    domainSearch: string;
    bulkDomainSearch: string;
    domainTransfer: string;
    websiteMigration: string;
    sharedHosting: string;
    wordpressHosting: string;
    resellerHosting: string;
    cloudHosting: string;
    vpsHosting: string;
    blog: string;
    expertTips: string;
    productUpdates: string;
    cart: string;
  };
  common: {
    billedInUsd: string;
  };
  locale: {
    selectLocation: string;
    searchPlaceholder: string;
    country: string;
    language: string;
    apply: string;
    close: string;
    noResults: string;
  };
  hero: {
    headline: string;
    headlineAccent: string;
    description: string;
    searchPlaceholder: string;
    bulkSearch: string;
    search: string;
    trustUptime: string;
    trustUptimeSub: string;
    trustSecure: string;
    trustSecureSub: string;
    trustSupport: string;
    trustSupportSub: string;
  };
  products: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    perYear: string;
    perMonth: string;
    perMailbox: string;
    startingPlan: string;
    domainTitle: string;
    domainBadge: string;
    domainHighlight: string;
    domainCta: string;
    domainSearchPlaceholder: string;
    emailTitle: string;
    emailSubtitle: string;
    emailBadge: string;
    emailCta: string;
    hostingTitle: string;
    hostingSubtitle: string;
    hostingBadge: string;
    hostingCta: string;
    domainFeatures: string[];
    emailFeatures: string[];
    hostingFeatures: string[];
  };
};

const en: Dictionary = {
  nav: {
    domains: "Domains",
    businessEmail: "Business Email",
    hosting: "Hosting",
    resources: "Resources",
    login: "Login",
    getStarted: "GET STARTED",
    pricing: "Pricing",
    beyondAi: "Beyond AI",
    contact: "Contact",
    about: "Our Story",
    solutions: "Solutions",
    domainSearch: "Domain Name Search",
    bulkDomainSearch: "Bulk Domain Search",
    domainTransfer: "Transfer Your Domain",
    websiteMigration: "Free Website Migration",
    sharedHosting: "Shared Hosting",
    wordpressHosting: "WordPress Hosting",
    resellerHosting: "Reseller Hosting",
    cloudHosting: "Cloud Hosting",
    vpsHosting: "VPS Hosting",
    blog: "Blog",
    expertTips: "Expert Tips",
    productUpdates: "Product Updates",
    cart: "Cart",
  },
  common: {
    billedInUsd: "Charged in USD at checkout.",
  },
  locale: {
    selectLocation: "Select language",
    searchPlaceholder: "Search language",
    country: "Country",
    language: "Language",
    apply: "Apply",
    close: "Close",
    noResults: "No languages found",
  },
  hero: {
    headline: "HOST SMARTER.",
    headlineAccent: "GROW BEYOND.",
    description:
      "High-performance hosting, secure infrastructure and expert support — built for everything you want to grow online.",
    searchPlaceholder: "Enter your domain name",
    bulkSearch: "Bulk Search",
    search: "Search Domain",
    trustUptime: "99.99% Uptime",
    trustUptimeSub: "Network Guarantee",
    trustSecure: "NVMe Performance",
    trustSecureSub: "Ultra-fast storage",
    trustSupport: "24/7 Expert Support",
    trustSupportSub: "We're here for you",
  },
  products: {
    eyebrow: "Everything You Need",
    title: "Power Your Online Success",
    titleAccent: "Everything in One Place",
    description:
      "Get premium domains, professional email, and blazing-fast hosting at unbeatable prices. Simple, secure, and built for your growth.",
    perYear: "/ 1 Year",
    perMonth: "/ Month",
    perMailbox: "Per Mailbox",
    startingPlan: "Starting Plan",
    domainTitle: "Domain Site",
    domainBadge: "Best Value",
    domainHighlight: "+ Free 2 Business Mail 1 Year",
    domainCta: "Find Your Domain",
    domainSearchPlaceholder: "Enter your domain name",
    emailTitle: "Business Email",
    emailSubtitle: "Professional Email for Your Business",
    emailBadge: "Professional",
    emailCta: "Get Business Email",
    hostingTitle: "Web Hosting",
    hostingSubtitle: "Blazing-Fast Hosting Plans",
    hostingBadge: "Fast & Reliable",
    hostingCta: "View Hosting Plans",
    domainFeatures: [
      "Free Domain Privacy Protection",
      "Free DNS Management",
      "24/7 Domain Support",
      "Easy Domain Management",
    ],
    emailFeatures: [
      "Custom Email Address",
      "Spam & Virus Protection",
      "99.99% Uptime Guarantee",
      "Webmail Access",
      "Mobile & Desktop Sync",
    ],
    hostingFeatures: [
      "Ultra-Fast NVMe SSD",
      "99.99% Uptime Guarantee",
      "Free SSL Certificate",
      "Daily Backups",
      "24/7 Expert Support",
    ],
  },
};

const ne: Dictionary = {
  ...en,
  nav: {
    ...en.nav,
    domains: "डोमेन",
    businessEmail: "व्यवसायिक इमेल",
    hosting: "होस्टिङ",
    resources: "स्रोतहरू",
    login: "लगइन",
    getStarted: "सुरु गर्नुहोस्",
  },
  locale: {
    selectLocation: "भाषा छान्नुहोस्",
    searchPlaceholder: "भाषा खोज्नुहोस्",
    country: "देश",
    language: "भाषा",
    apply: "लागु गर्नुहोस्",
    close: "बन्द गर्नुहोस्",
    noResults: "कुनै भाषा फेला परेन",
  },
  hero: {
    headline: "तपाईंलाई चाहिने सबै।",
    headlineAccent: "अपेक्षाभन्दा पर।",
    description:
      "प्रिमियम डोमेन, छिटो होस्टिङ र सुरक्षित व्यवसायिक इमेल — अनलाइन सफलताका लागि आवश्यक सबै।",
    searchPlaceholder: "आफ्नो उत्तम डोमेन खोज्नुहोस्",
    bulkSearch: "बल्क खोज",
    search: "खोज्नुहोस्",
    trustUptime: "९९.९९% अपटाइम",
    trustUptimeSub: "नेटवर्क ग्यारेन्टी",
    trustSecure: "सुरक्षित र भरपर्दो",
    trustSecureSub: "तपाईंको डाटा सुरक्षित छ",
    trustSupport: "२४/७ विशेषज्ञ सहयोग",
    trustSupportSub: "हामी तपाईंका लागि छौं",
  },
  products: {
    ...en.products,
    eyebrow: "तपाईंलाई चाहिने सबै",
    title: "अनलाइन सफलता सशक्त बनाउनुहोस्",
    titleAccent: "सबै एकै ठाउँमा",
    description:
      "प्रिमियम डोमेन, व्यावसायिक इमेल र छिटो होस्टिङ किफायती मूल्यमा। सरल, सुरक्षित र वृद्धिमुखी।",
    perYear: "/ १ वर्ष",
    perMonth: "/ महिना",
    perMailbox: "प्रति मेलबक्स",
    startingPlan: "सुरुवाती योजना",
    domainTitle: "डोमेन साइट",
    domainBadge: "उत्तम मूल्य",
    domainHighlight: "+ निःशुल्क २ बिजनेस मेल १ वर्ष",
    domainCta: "डोमेन खोज्नुहोस्",
    domainSearchPlaceholder: "आफ्नो डोमेन नाम लेख्नुहोस्",
    emailTitle: "व्यवसायिक इमेल",
    emailSubtitle: "तपाईंको व्यवसायका लागि व्यावसायिक इमेल",
    emailBadge: "प्रोफेसनल",
    emailCta: "व्यवसायिक इमेल लिनुहोस्",
    hostingTitle: "वेब होस्टिङ",
    hostingSubtitle: "अत्यन्त छिटो होस्टिङ योजनाहरू",
    hostingBadge: "छिटो र भरपर्दो",
    hostingCta: "होस्टिङ योजना हेर्नुहोस्",
    domainFeatures: [
      "निःशुल्क डोमेन प्राइभेसी सुरक्षा",
      "निःशुल्क DNS व्यवस्थापन",
      "२४/७ डोमेन सहयोग",
      "सजिलो डोमेन व्यवस्थापन",
    ],
    emailFeatures: [
      "कस्टम इमेल ठेगाना",
      "स्प्याम र भाइरस सुरक्षा",
      "९९.९९% अपटाइम ग्यारेन्टी",
      "वेबमेल पहुँच",
      "मोबाइल र डेस्कटप सिंक",
    ],
    hostingFeatures: [
      "अल्ट्रा-फास्ट NVMe SSD",
      "९९.९९% अपटाइम ग्यारेन्टी",
      "निःशुल्क SSL प्रमाणपत्र",
      "दैनिक ब्याकअप",
      "२४/७ विशेषज्ञ सहयोग",
    ],
  },
};

const hi: Dictionary = {
  ...en,
  nav: {
    ...en.nav,
    domains: "डोमेन",
    businessEmail: "बिज़नेस ईमेल",
    hosting: "होस्टिंग",
    resources: "संसाधन",
    login: "लॉगिन",
    getStarted: "शुरू करें",
    pricing: "कीमतें",
    contact: "संपर्क",
    about: "हमारी कहानी",
    solutions: "समाधान",
    domainSearch: "डोमेन नाम खोज",
    bulkDomainSearch: "बल्क डोमेन खोज",
    domainTransfer: "डोमेन ट्रांसफर",
    websiteMigration: "मुफ़्त वेबसाइट माइग्रेशन",
    sharedHosting: "शेयर्ड होस्टिंग",
    wordpressHosting: "वर्डप्रेस होस्टिंग",
    resellerHosting: "रीसेलर होस्टिंग",
    cloudHosting: "क्लाउड होस्टिंग",
    vpsHosting: "VPS होस्टिंग",
    blog: "ब्लॉग",
    expertTips: "विशेषज्ञ टिप्स",
    productUpdates: "प्रॉडक्ट अपडेट",
    cart: "कार्ट",
  },
  common: {
    billedInUsd: "चेकआउट पर भुगतान USD में होगा।",
  },
  locale: {
    selectLocation: "भाषा चुनें",
    searchPlaceholder: "भाषा खोजें",
    country: "देश",
    language: "भाषा",
    apply: "लागू करें",
    close: "बंद करें",
    noResults: "कोई भाषा नहीं मिली",
  },
  hero: {
    headline: "आपको जो चाहिए।",
    headlineAccent: "उम्मीदों से आगे।",
    description:
      "प्रीमियम डोमेन, तेज़ होस्टिंग और सुरक्षित बिज़नेस ईमेल — ऑनलाइन सफलता के लिए सब कुछ।",
    searchPlaceholder: "अपना परफेक्ट डोमेन खोजें",
    bulkSearch: "बल्क सर्च",
    search: "खोजें",
    trustUptime: "99.99% अपटाइम",
    trustUptimeSub: "नेटवर्क गारंटी",
    trustSecure: "सुरक्षित और विश्वसनीय",
    trustSecureSub: "आपका डेटा सुरक्षित है",
    trustSupport: "24/7 विशेषज्ञ सहायता",
    trustSupportSub: "हम आपके साथ हैं",
  },
  products: {
    ...en.products,
    eyebrow: "आपको जो चाहिए",
    title: "अपनी ऑनलाइन सफलता को शक्ति दें",
    titleAccent: "सब कुछ एक जगह",
    description:
      "प्रीमियम डोमेन, प्रोफेशनल ईमेल और तेज़ होस्टिंग बेहतरीन कीमत पर। सरल, सुरक्षित और विकास के लिए।",
    perYear: "/ 1 वर्ष",
    perMonth: "/ माह",
    perMailbox: "प्रति मेलबॉक्स",
    startingPlan: "स्टार्टिंग प्लान",
    domainTitle: "डोमेन साइट",
    domainBadge: "बेस्ट वैल्यू",
    domainHighlight: "+ फ्री 2 बिज़नेस मेल 1 वर्ष",
    domainCta: "अपना डोमेन खोजें",
    domainSearchPlaceholder: "अपना डोमेन नाम दर्ज करें",
    emailTitle: "बिज़नेस ईमेल",
    emailSubtitle: "आपके व्यवसाय के लिए प्रोफेशनल ईमेल",
    emailBadge: "प्रोफेशनल",
    emailCta: "बिज़नेस ईमेल लें",
    hostingTitle: "वेब होस्टिंग",
    hostingSubtitle: "बहुत तेज़ होस्टिंग प्लान",
    hostingBadge: "तेज़ और भरोसेमंद",
    hostingCta: "होस्टिंग प्लान देखें",
    domainFeatures: [
      "मुफ़्त डोमेन प्राइवेसी सुरक्षा",
      "मुफ़्त DNS प्रबंधन",
      "24/7 डोमेन सपोर्ट",
      "आसान डोमेन प्रबंधन",
    ],
    emailFeatures: [
      "कस्टम ईमेल पता",
      "स्पैम और वायरस सुरक्षा",
      "99.99% अपटाइम गारंटी",
      "वेबमेल एक्सेस",
      "मोबाइल और डेस्कटॉप सिंक",
    ],
    hostingFeatures: [
      "अल्ट्रा-फास्ट NVMe SSD",
      "99.99% अपटाइम गारंटी",
      "मुफ़्त SSL सर्टिफिकेट",
      "दैनिक बैकअप",
      "24/7 विशेषज्ञ सहायता",
    ],
  },
};

const es: Dictionary = {
  ...en,
  nav: {
    ...en.nav,
    domains: "Dominios",
    businessEmail: "Correo empresarial",
    hosting: "Hosting",
    resources: "Recursos",
    login: "Iniciar sesión",
    getStarted: "Comenzar",
  },
  locale: {
    selectLocation: "Selecciona el idioma",
    searchPlaceholder: "Buscar idioma",
    country: "País",
    language: "Idioma",
    apply: "Aplicar",
    close: "Cerrar",
    noResults: "No se encontró ningún idioma",
  },
  hero: {
    headline: "Todo lo que necesitas.",
    headlineAccent: "Más allá de las expectativas.",
    description:
      "Dominios premium, hosting ultrarrápido y correo empresarial seguro: todo para crecer online.",
    searchPlaceholder: "Encuentra tu dominio perfecto",
    bulkSearch: "Búsqueda masiva",
    search: "Buscar",
    trustUptime: "99.99% de disponibilidad",
    trustUptimeSub: "Garantía de red",
    trustSecure: "Seguro y confiable",
    trustSecureSub: "Tus datos están protegidos",
    trustSupport: "Soporte experto 24/7",
    trustSupportSub: "Estamos contigo",
  },
  products: {
    ...en.products,
    eyebrow: "Todo lo que necesitas",
    title: "Impulsa tu éxito online",
    titleAccent: "Todo en un solo lugar",
    description:
      "Dominios premium, correo profesional y hosting ultrarrápido a precios excelentes.",
    perYear: "/ 1 año",
    perMonth: "/ mes",
    perMailbox: "Por buzón",
    startingPlan: "Plan inicial",
    domainTitle: "Sitio de dominio",
    domainBadge: "Mejor valor",
    domainHighlight: "+ 2 correos empresariales gratis 1 año",
    domainCta: "Encuentra tu dominio",
    domainSearchPlaceholder: "Introduce tu nombre de dominio",
    emailTitle: "Correo empresarial",
    emailSubtitle: "Correo profesional para tu negocio",
    emailBadge: "Profesional",
    emailCta: "Obtener correo empresarial",
    hostingTitle: "Hosting web",
    hostingSubtitle: "Planes de hosting ultrarrápidos",
    hostingBadge: "Rápido y fiable",
    hostingCta: "Ver planes de hosting",
  },
};

const fr: Dictionary = {
  ...en,
  nav: {
    ...en.nav,
    domains: "Domaines",
    businessEmail: "E-mail pro",
    hosting: "Hébergement",
    resources: "Ressources",
    login: "Connexion",
    getStarted: "Commencer",
  },
  locale: {
    selectLocation: "Choisir la langue",
    searchPlaceholder: "Rechercher une langue",
    country: "Pays",
    language: "Langue",
    apply: "Appliquer",
    close: "Fermer",
    noResults: "Aucune langue trouvée",
  },
  hero: {
    headline: "Tout ce dont vous avez besoin.",
    headlineAccent: "Au-delà des attentes.",
    description:
      "Domaines premium, hébergement ultra-rapide et e-mail professionnel sécurisé — tout pour réussir en ligne.",
    searchPlaceholder: "Trouvez votre domaine idéal",
    bulkSearch: "Recherche groupée",
    search: "Rechercher",
    trustUptime: "99,99 % de disponibilité",
    trustUptimeSub: "Garantie réseau",
    trustSecure: "Sécurisé et fiable",
    trustSecureSub: "Vos données sont protégées",
    trustSupport: "Support expert 24/7",
    trustSupportSub: "Nous sommes là",
  },
  products: {
    ...en.products,
    eyebrow: "Tout ce dont vous avez besoin",
    title: "Boostez votre réussite en ligne",
    titleAccent: "Tout au même endroit",
    description:
      "Domaines premium, e-mail pro et hébergement ultra-rapide à des prix imbattables.",
    perYear: "/ 1 an",
    perMonth: "/ mois",
    perMailbox: "Par boîte mail",
    startingPlan: "Offre de démarrage",
    domainTitle: "Nom de domaine",
    domainBadge: "Meilleur rapport",
    domainHighlight: "+ 2 e-mails pro gratuits 1 an",
    domainCta: "Trouver votre domaine",
    domainSearchPlaceholder: "Entrez votre nom de domaine",
    emailTitle: "E-mail professionnel",
    emailSubtitle: "E-mail professionnel pour votre entreprise",
    emailBadge: "Professionnel",
    emailCta: "Obtenir l'e-mail pro",
    hostingTitle: "Hébergement web",
    hostingSubtitle: "Plans d'hébergement ultra-rapides",
    hostingBadge: "Rapide et fiable",
    hostingCta: "Voir les plans d'hébergement",
  },
};

const de: Dictionary = {
  ...en,
  nav: {
    ...en.nav,
    domains: "Domains",
    businessEmail: "Business-E-Mail",
    hosting: "Hosting",
    resources: "Ressourcen",
    login: "Anmelden",
    getStarted: "Loslegen",
  },
  locale: {
    selectLocation: "Sprache wählen",
    searchPlaceholder: "Sprache suchen",
    country: "Land",
    language: "Sprache",
    apply: "Übernehmen",
    close: "Schließen",
    noResults: "Keine Sprache gefunden",
  },
  hero: {
    headline: "Alles, was Sie brauchen.",
    headlineAccent: "Über alle Erwartungen hinaus.",
    description:
      "Premium-Domains, blitzschnelles Hosting und sichere Business-E-Mail — alles für Ihren Online-Erfolg.",
    searchPlaceholder: "Finden Sie Ihre perfekte Domain",
    bulkSearch: "Massensuche",
    search: "Suchen",
    trustUptime: "99,99 % Verfügbarkeit",
    trustUptimeSub: "Netzwerkgarantie",
    trustSecure: "Sicher & vertrauenswürdig",
    trustSecureSub: "Ihre Daten sind geschützt",
    trustSupport: "24/7 Experten-Support",
    trustSupportSub: "Wir sind für Sie da",
  },
  products: {
    ...en.products,
    eyebrow: "Alles, was Sie brauchen",
    title: "Stärken Sie Ihren Online-Erfolg",
    titleAccent: "Alles an einem Ort",
    description:
      "Premium-Domains, Business-E-Mail und blitzschnelles Hosting zu Top-Preisen.",
    perYear: "/ 1 Jahr",
    perMonth: "/ Monat",
    perMailbox: "Pro Postfach",
    startingPlan: "Startplan",
    domainTitle: "Domain",
    domainBadge: "Bestes Angebot",
    domainHighlight: "+ 2 Business-Mails gratis 1 Jahr",
    domainCta: "Domain finden",
    domainSearchPlaceholder: "Domainnamen eingeben",
    emailTitle: "Business-E-Mail",
    emailSubtitle: "Professionelle E-Mail für Ihr Unternehmen",
    emailBadge: "Professionell",
    emailCta: "Business-E-Mail holen",
    hostingTitle: "Webhosting",
    hostingSubtitle: "Blitzschnelle Hosting-Tarife",
    hostingBadge: "Schnell & zuverlässig",
    hostingCta: "Hosting-Tarife ansehen",
  },
};

const dictionaries: Record<LanguageCode, Dictionary> = {
  en,
  ne,
  hi,
  es,
  fr,
  de,
  it: {
    ...en,
    nav: {
      ...en.nav,
      domains: "Domini",
      businessEmail: "Email aziendale",
      hosting: "Hosting",
      resources: "Risorse",
      login: "Accedi",
      getStarted: "Inizia",
    },
    locale: {
      selectLocation: "Seleziona la lingua",
      searchPlaceholder: "Cerca lingua",
      country: "Paese",
      language: "Lingua",
      apply: "Applica",
      close: "Chiudi",
      noResults: "Nessuna lingua trovata",
    },
    hero: {
      headline: "Tutto ciò di cui hai bisogno.",
      headlineAccent: "Oltre ogni aspettativa.",
      description:
        "Domini premium, hosting rapidissimo e email aziendale sicura — tutto per crescere online.",
      searchPlaceholder: "Trova il dominio perfetto",
      bulkSearch: "Ricerca multipla",
      search: "Cerca",
      trustUptime: "99,99% di uptime",
      trustUptimeSub: "Garanzia di rete",
      trustSecure: "Sicuro e affidabile",
      trustSecureSub: "I tuoi dati sono al sicuro",
      trustSupport: "Supporto esperti 24/7",
      trustSupportSub: "Siamo qui per te",
    },
    products: {
      ...en.products,
      eyebrow: "Tutto ciò di cui hai bisogno",
      title: "Dai potenza al tuo successo online",
      titleAccent: "Tutto in un unico posto",
      perYear: "/ 1 anno",
      perMonth: "/ mese",
      perMailbox: "Per casella",
      startingPlan: "Piano iniziale",
      domainTitle: "Dominio",
      domainBadge: "Miglior valore",
      domainHighlight: "+ 2 email aziendali gratis 1 anno",
      domainCta: "Trova il tuo dominio",
      domainSearchPlaceholder: "Inserisci il nome di dominio",
      emailTitle: "Email aziendale",
      emailSubtitle: "Email professionale per la tua attività",
      emailBadge: "Professionale",
      emailCta: "Ottieni email aziendale",
      hostingTitle: "Hosting web",
      hostingSubtitle: "Piani hosting ultraveloci",
      hostingBadge: "Veloce e affidabile",
      hostingCta: "Vedi piani hosting",
    },
  },
  pt: {
    ...en,
    nav: {
      ...en.nav,
      domains: "Domínios",
      businessEmail: "E-mail comercial",
      hosting: "Hospedagem",
      resources: "Recursos",
      login: "Entrar",
      getStarted: "Começar",
    },
    locale: {
      selectLocation: "Selecione o idioma",
      searchPlaceholder: "Pesquisar idioma",
      country: "País",
      language: "Idioma",
      apply: "Aplicar",
      close: "Fechar",
      noResults: "Nenhum idioma encontrado",
    },
    hero: {
      headline: "Tudo o que você precisa.",
      headlineAccent: "Além das expectativas.",
      description:
        "Domínios premium, hospedagem ultrarrápida e e-mail comercial seguro — tudo para crescer online.",
      searchPlaceholder: "Encontre o domínio perfeito",
      bulkSearch: "Busca em massa",
      search: "Pesquisar",
      trustUptime: "99,99% de uptime",
      trustUptimeSub: "Garantia de rede",
      trustSecure: "Seguro e confiável",
      trustSecureSub: "Seus dados estão protegidos",
      trustSupport: "Suporte especialista 24/7",
      trustSupportSub: "Estamos com você",
    },
    products: {
      ...en.products,
      eyebrow: "Tudo o que você precisa",
      title: "Impulsione seu sucesso online",
      titleAccent: "Tudo em um só lugar",
      perYear: "/ 1 ano",
      perMonth: "/ mês",
      perMailbox: "Por caixa",
      startingPlan: "Plano inicial",
      domainTitle: "Domínio",
      domainBadge: "Melhor valor",
      domainHighlight: "+ 2 e-mails comerciais grátis 1 ano",
      domainCta: "Encontre seu domínio",
      domainSearchPlaceholder: "Digite o nome do domínio",
      emailTitle: "E-mail comercial",
      emailSubtitle: "E-mail profissional para o seu negócio",
      emailBadge: "Profissional",
      emailCta: "Obter e-mail comercial",
      hostingTitle: "Hospedagem web",
      hostingSubtitle: "Planos de hospedagem ultrarrápidos",
      hostingBadge: "Rápido e confiável",
      hostingCta: "Ver planos de hospedagem",
    },
  },
  ja: {
    ...en,
    nav: {
      ...en.nav,
      domains: "ドメイン",
      businessEmail: "ビジネスメール",
      hosting: "ホスティング",
      resources: "リソース",
      login: "ログイン",
      getStarted: "はじめる",
    },
    locale: {
      selectLocation: "言語を選択",
      searchPlaceholder: "言語を検索",
      country: "国",
      language: "言語",
      apply: "適用",
      close: "閉じる",
      noResults: "言語が見つかりません",
    },
    hero: {
      headline: "必要なすべてを。",
      headlineAccent: "期待を超えて。",
      description:
        "プレミアムドメイン、超高速ホスティング、安全なビジネスメール — オンライン成功に必要なすべて。",
      searchPlaceholder: "理想のドメインを探す",
      bulkSearch: "一括検索",
      search: "検索",
      trustUptime: "稼働率 99.99%",
      trustUptimeSub: "ネットワーク保証",
      trustSecure: "安全で信頼できる",
      trustSecureSub: "データは保護されています",
      trustSupport: "24時間専門家サポート",
      trustSupportSub: "いつでも対応します",
    },
    products: {
      ...en.products,
      eyebrow: "必要なすべて",
      title: "オンライン成功を加速",
      titleAccent: "すべてを一か所で",
      perYear: "/ 1年",
      perMonth: "/ 月",
      perMailbox: "メールボックスごと",
      startingPlan: "スタータープラン",
      domainTitle: "ドメイン",
      domainBadge: "ベストバリュー",
      domainHighlight: "+ ビジネスメール2件1年無料",
      domainCta: "ドメインを探す",
      domainSearchPlaceholder: "ドメイン名を入力",
      emailTitle: "ビジネスメール",
      emailSubtitle: "ビジネス向けプロフェッショナルメール",
      emailBadge: "プロフェッショナル",
      emailCta: "ビジネスメールを取得",
      hostingTitle: "ウェブホスティング",
      hostingSubtitle: "超高速ホスティングプラン",
      hostingBadge: "高速＆安定",
      hostingCta: "ホスティングプランを見る",
    },
  },
  ko: {
    ...en,
    nav: {
      ...en.nav,
      domains: "도메인",
      businessEmail: "비즈니스 이메일",
      hosting: "호스팅",
      resources: "리소스",
      login: "로그인",
      getStarted: "시작하기",
    },
    locale: {
      selectLocation: "언어 선택",
      searchPlaceholder: "언어 검색",
      country: "국가",
      language: "언어",
      apply: "적용",
      close: "닫기",
      noResults: "언어를 찾을 수 없습니다",
    },
    hero: {
      headline: "필요한 모든 것.",
      headlineAccent: "기대 그 이상.",
      description:
        "프리미엄 도메인, 초고속 호스팅, 안전한 비즈니스 이메일 — 온라인 성공에 필요한 모든 것.",
      searchPlaceholder: "완벽한 도메인 찾기",
      bulkSearch: "대량 검색",
      search: "검색",
      trustUptime: "99.99% 가동률",
      trustUptimeSub: "네트워크 보장",
      trustSecure: "안전하고 신뢰할 수 있음",
      trustSecureSub: "데이터가 보호됩니다",
      trustSupport: "24/7 전문가 지원",
      trustSupportSub: "언제나 함께합니다",
    },
    products: {
      ...en.products,
      eyebrow: "필요한 모든 것",
      title: "온라인 성공을 가속화하세요",
      titleAccent: "모든 것을 한곳에서",
      perYear: "/ 1년",
      perMonth: "/ 월",
      perMailbox: "사서함당",
      startingPlan: "스타터 플랜",
      domainTitle: "도메인",
      domainBadge: "최고의 가치",
      domainHighlight: "+ 비즈니스 메일 2개 1년 무료",
      domainCta: "도메인 찾기",
      domainSearchPlaceholder: "도메인 이름 입력",
      emailTitle: "비즈니스 이메일",
      emailSubtitle: "비즈니스를 위한 프로 이메일",
      emailBadge: "프로페셔널",
      emailCta: "비즈니스 이메일 받기",
      hostingTitle: "웹 호스팅",
      hostingSubtitle: "초고속 호스팅 플랜",
      hostingBadge: "빠르고 안정적",
      hostingCta: "호스팅 플랜 보기",
    },
  },
  zh: {
    ...en,
    nav: {
      ...en.nav,
      domains: "域名",
      businessEmail: "企业邮箱",
      hosting: "主机托管",
      resources: "资源",
      login: "登录",
      getStarted: "立即开始",
    },
    locale: {
      selectLocation: "选择语言",
      searchPlaceholder: "搜索语言",
      country: "国家",
      language: "语言",
      apply: "应用",
      close: "关闭",
      noResults: "未找到语言",
    },
    hero: {
      headline: "您所需的一切。",
      headlineAccent: "超越期待。",
      description: "优质域名、极速主机与安全企业邮箱 — 助力您的在线成功。",
      searchPlaceholder: "寻找理想域名",
      bulkSearch: "批量搜索",
      search: "搜索",
      trustUptime: "99.99% 正常运行时间",
      trustUptimeSub: "网络保障",
      trustSecure: "安全可靠",
      trustSecureSub: "您的数据受到保护",
      trustSupport: "全天候专家支持",
      trustSupportSub: "随时为您服务",
    },
    products: {
      ...en.products,
      eyebrow: "您所需的一切",
      title: "助力在线成功",
      titleAccent: "一站齐全",
      perYear: "/ 1年",
      perMonth: "/ 月",
      perMailbox: "每个邮箱",
      startingPlan: "入门方案",
      domainTitle: "域名",
      domainBadge: "超值之选",
      domainHighlight: "+ 免费企业邮箱 2个 1年",
      domainCta: "查找域名",
      domainSearchPlaceholder: "输入域名",
      emailTitle: "企业邮箱",
      emailSubtitle: "专业商务邮箱",
      emailBadge: "专业",
      emailCta: "获取企业邮箱",
      hostingTitle: "网站托管",
      hostingSubtitle: "极速主机方案",
      hostingBadge: "快速可靠",
      hostingCta: "查看主机方案",
    },
  },
  ar: {
    ...en,
    nav: {
      ...en.nav,
      domains: "النطاقات",
      businessEmail: "البريد التجاري",
      hosting: "الاستضافة",
      resources: "الموارد",
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
    },
    locale: {
      selectLocation: "اختر اللغة",
      searchPlaceholder: "ابحث عن لغة",
      country: "البلد",
      language: "اللغة",
      apply: "تطبيق",
      close: "إغلاق",
      noResults: "لم يتم العثور على لغة",
    },
    hero: {
      headline: "كل ما تحتاجه.",
      headlineAccent: "أبعد من التوقعات.",
      description:
        "نطاقات مميزة واستضافة سريعة وبريد أعمال آمن — كل ما تحتاجه للنجاح عبر الإنترنت.",
      searchPlaceholder: "اعثر على نطاقك المثالي",
      bulkSearch: "بحث جماعي",
      search: "بحث",
      trustUptime: "توافر 99.99%",
      trustUptimeSub: "ضمان الشبكة",
      trustSecure: "آمن وموثوق",
      trustSecureSub: "بياناتك محمية",
      trustSupport: "دعم خبراء على مدار الساعة",
      trustSupportSub: "نحن معك",
    },
    products: {
      ...en.products,
      eyebrow: "كل ما تحتاجه",
      title: "عزّز نجاحك عبر الإنترنت",
      titleAccent: "كل شيء في مكان واحد",
      perYear: "/ سنة",
      perMonth: "/ شهر",
      perMailbox: "لكل صندوق بريد",
      startingPlan: "الخطة الأساسية",
      domainTitle: "النطاق",
      domainBadge: "أفضل قيمة",
      domainHighlight: "+ بريدان للأعمال مجانًا لمدة سنة",
      domainCta: "اعثر على نطاقك",
      domainSearchPlaceholder: "أدخل اسم النطاق",
      emailTitle: "البريد التجاري",
      emailSubtitle: "بريد احترافي لأعمالك",
      emailBadge: "احترافي",
      emailCta: "احصل على البريد التجاري",
      hostingTitle: "استضافة الويب",
      hostingSubtitle: "خطط استضافة فائقة السرعة",
      hostingBadge: "سريع وموثوق",
      hostingCta: "عرض خطط الاستضافة",
    },
  },
};

export function getDictionary(lang: LanguageCode): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}

export function t(dict: Dictionary, path: string): string {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (!current || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}
