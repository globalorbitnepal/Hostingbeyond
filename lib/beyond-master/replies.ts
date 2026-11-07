import {
  primaryLanguageSubtag,
  type ConversationLocale,
} from "@/lib/beyond-master/locale";
import type { AgentLanguage } from "@/lib/beyond-master/language";

type Copy = {
  greeting: (name?: string | null) => string;
  askDomainName: string;
  bulkSearch: string;
  domainHeading: (query: string) => string;
  domainFailed: string;
  domainEmpty: (query: string) => string;
  domainFooter: (href: string) => string;
  hostingHeading: string;
  hostingNoCatalog: string;
  hostingFooter: string;
  domainPriceHeading: (tlds: string) => string;
  domainPriceNone: string;
  email: string;
  dns: string;
  ssl: string;
  billing: string;
  support: string;
  website: string;
  /** When a guest asks for private account data — never imply another account exists. */
  guestSignInForAccount: string;
  fallback: (name?: string | null) => string;
  statusAvailable: string;
  statusTaken: string;
  statusPremium: string;
  statusUnknown: string;
  perYear: string;
  perYearShort: string;
  from: string;
  languageName: string;
};

const EN: Copy = {
  greeting: (name) =>
    `${name ? `Hi ${name}!` : "Hi!"} Tell me what you'd like to get started with — a domain, hosting, business email, or your website — or describe it in your own words.`,
  askDomainName:
    "Tell me the name you want — for example bakery.com or just bakery — and I will check live availability and nearby extensions. You can also search at /domain-name-search.",
  bulkSearch:
    "Bulk domain search is at /bulk-domain-search. You can check up to 10 names together there. Send me one name in this chat, like bakery.com, if you want a live availability check right now.",
  domainHeading: (query) => `Here is a live check for ${query}:`,
  domainFailed:
    "I could not reach the domain checker just now. Please try again in a moment, or open /domain-name-search.",
  domainEmpty: (query) =>
    `I did not get any rows back for ${query}. Open /domain-name-search to check it again.`,
  domainFooter: (href) =>
    `Open ${href} to register an available name. I cannot complete checkout from this chat.`,
  hostingHeading: "Here are the live HostingBeyond plans:",
  hostingNoCatalog:
    "I could not read live plan prices just now. The current plans and prices are on /pricing — I will not guess an amount.",
  hostingFooter:
    "Tell me what you are building — WordPress, a shop, a Node.js app, or a VPS — and I will narrow it down.",
  domainPriceHeading: (tlds) => `Live domain prices for ${tlds}:`,
  domainPriceNone:
    "I could not read the live domain price catalog. /domain-name-search shows the current register, renew, and transfer amounts.",
  email:
    "Business email on your own domain starts at /business-email. Pick a plan, connect a domain you already own or register one here, then choose the mailbox name. I will not invent mailbox prices or MX records.",
  dns: "You can edit A, AAAA, CNAME, MX, TXT, NS, and SRV records from the domain in /account/my-domains. The panel default TTL is 3600 seconds; MX and SRV also take a priority.\nTell me the domain, record type, host, and value if you want me to prepare a change for review.",
  ssl: "SSL is included on the active HostingBeyond hosting plans that list it. Issue or renew it from the hosting service in your account after the domain points at our nameservers. I cannot switch SSL on from this chat.",
  billing:
    "Invoices, wallet, and payment history are in your HostingBeyond account billing pages after you sign in. I will not invent a balance, invoice number, or refund.",
  support:
    "I can prepare a support request from this chat. You still submit it with the ticket card, and I will not invent a ticket number or claim a person is online.",
  guestSignInForAccount:
    "Sign in to your HostingBeyond customer account to view your own domains, hosting, invoices, orders, DNS, or tickets. Without signing in I can only give public information — I cannot look up or confirm any customer's private records.",
  website:
    "For a new site start at /web-hosting, or /web-hosting/wordpress if you want WordPress. If a live site is broken, tell me the domain and the exact error and I will walk through DNS, SSL, and the hosting service step by step.",
  fallback: (name) =>
    `${name ? `${name}, I` : "I"} can check a domain, compare hosting plans and prices, set up business email, help with DNS or SSL, or look at a website problem. Tell me which one, or send a name like example.com.`,
  statusAvailable: "available",
  statusTaken: "already taken",
  statusPremium: "premium price",
  statusUnknown: "could not be verified",
  perYear: "per year",
  perYearShort: "/yr",
  from: "from",
  languageName: "English",
};

const HI: Copy = {
  greeting: (name) =>
    `${name ? `नमस्ते ${name}!` : "नमस्ते!"} बताइए आप किस चीज़ से शुरू करना चाहते हैं — डोमेन, होस्टिंग, बिज़नेस ईमेल या अपनी वेबसाइट — या अपने शब्दों में लिखिए।`,
  askDomainName:
    "जिस नाम की जाँच करनी है वह बताइए — जैसे bakery.com या सिर्फ़ bakery — मैं लाइव उपलब्धता और आस-पास के एक्सटेंशन देख लूँगा। /domain-name-search पर भी खोज सकते हैं।",
  bulkSearch:
    "बल्क डोमेन सर्च /bulk-domain-search पर है, जहाँ एक साथ 10 नाम तक जाँच सकते हैं। अभी एक नाम इस चैट में भेजिए, जैसे bakery.com, तो मैं लाइव उपलब्धता देख दूँगा।",
  domainHeading: (query) => `${query} की लाइव जाँच:`,
  domainFailed:
    "अभी डोमेन चेकर से संपर्क नहीं हो पाया। थोड़ी देर बाद फिर कोशिश करें या /domain-name-search खोलें।",
  domainEmpty: (query) =>
    `${query} के लिए कोई नतीजा नहीं मिला। /domain-name-search पर दोबारा जाँच लें।`,
  domainFooter: (href) =>
    `उपलब्ध नाम रजिस्टर करने के लिए ${href} खोलें। इस चैट से चेकआउट पूरा नहीं हो सकता।`,
  hostingHeading: "ये HostingBeyond के लाइव प्लान हैं:",
  hostingNoCatalog:
    "अभी लाइव प्लान कीमतें नहीं पढ़ पाया। मौजूदा प्लान और कीमतें /pricing पर हैं — मैं अनुमान से कीमत नहीं बताऊँगा।",
  hostingFooter:
    "बताइए आप क्या बना रहे हैं — WordPress, दुकान, Node.js ऐप या VPS — मैं सही प्लान बता दूँगा।",
  domainPriceHeading: (tlds) => `${tlds} की लाइव डोमेन कीमतें:`,
  domainPriceNone:
    "लाइव डोमेन कीमत सूची नहीं पढ़ पाया। /domain-name-search पर मौजूदा रजिस्टर, रिन्यू और ट्रांसफर कीमत दिखती है।",
  email:
    "अपने डोमेन पर बिज़नेस ईमेल /business-email से शुरू होता है। प्लान चुनें, अपना डोमेन जोड़ें या यहीं रजिस्टर करें, फिर मेलबॉक्स नाम चुनें। मैं मेलबॉक्स कीमत या MX रिकॉर्ड अनुमान से नहीं बताऊँगा।",
  dns: "डोमेन पैनल में A, AAAA, CNAME, MX, TXT, NS और SRV रिकॉर्ड बदल सकते हैं (/account/my-domains)। पैनल का डिफ़ॉल्ट TTL 3600 सेकंड है; MX और SRV में प्राथमिकता भी होती है।\nबदलाव समीक्षा के लिए तैयार कराना हो तो डोमेन, रिकॉर्ड टाइप, होस्ट और वैल्यू बताइए।",
  ssl: "SSL उन सक्रिय HostingBeyond होस्टिंग प्लान में शामिल है जिनमें लिखा है। डोमेन हमारे नेमसर्वर पर आने के बाद अकाउंट की होस्टिंग सेवा से SSL जारी या रिन्यू करें। इस चैट से SSL चालू नहीं हो सकता।",
  billing:
    "इनवॉइस, वॉलेट और भुगतान इतिहास लॉग इन करने के बाद आपके HostingBeyond अकाउंट के बिलिंग पेजों में हैं। मैं बैलेंस, इनवॉइस नंबर या रिफंड अनुमान से नहीं बताऊँगा।",
  support:
    "इस चैट से सपोर्ट रिक्वेस्ट तैयार कर सकता हूँ। टिकट कार्ड से आपको सबमिट करना होगा; मैं टिकट नंबर नहीं बनाऊँगा और यह नहीं कहूँगा कि कोई व्यक्ति ऑनलाइन है।",
  guestSignInForAccount:
    "अपने डोमेन, होस्टिंग, इनवॉइस, ऑर्डर, DNS या टिकट देखने के लिए HostingBeyond ग्राहक खाते में साइन इन करें। बिना लॉग इन के मैं सिर्फ़ सार्वजनिक जानकारी दे सकता हूँ — किसी ग्राहक का निजी डेटा नहीं देख या पुष्टि कर सकता।",
  website:
    "नई साइट के लिए /web-hosting से शुरू करें, WordPress चाहिए तो /web-hosting/wordpress। चालू साइट खराब है तो डोमेन और सटीक एरर बताइए — मैं DNS, SSL और होस्टिंग सेवा क्रम से देखूँगा।",
  fallback: (name) =>
    `${name ? `${name}, मैं` : "मैं"} डोमेन जाँच, होस्टिंग प्लान और कीमत तुलना, बिज़नेस ईमेल, DNS या SSL में मदद, और वेबसाइट समस्या देख सकता हूँ। बताइए कौन-सा, या example.com जैसा नाम भेजिए।`,
  statusAvailable: "उपलब्ध",
  statusTaken: "पहले से बुक है",
  statusPremium: "प्रीमियम कीमत",
  statusUnknown: "जाँच नहीं हो सकी",
  perYear: "प्रति वर्ष",
  perYearShort: "/वर्ष",
  from: "से शुरू",
  languageName: "हिन्दी",
};

const NE: Copy = {
  greeting: (name) =>
    `${name ? `नमस्ते ${name}!` : "नमस्ते!"} तपाईं केबाट सुरु गर्न चाहनुहुन्छ — डोमेन, होस्टिङ, व्यवसायिक इमेल वा आफ्नो वेबसाइट — बताउनुहोस्, वा आफ्नै शब्दमा लेख्नुहोस्।`,
  askDomainName:
    "जाँच गर्नुपर्ने नाम बताउनुहोस् — जस्तै bakery.com वा bakery मात्र — म लाइभ उपलब्धता र नजिकका एक्सटेन्सन हेर्छु। /domain-name-search मा पनि खोज्न सक्नुहुन्छ।",
  bulkSearch:
    "बल्क डोमेन खोज /bulk-domain-search मा छ, जहाँ एकैचोटि 10 नामसम्म जाँच्न सकिन्छ। अहिले एउटा नाम यही च्याटमा पठाउनुहोस्, जस्तै bakery.com, म लाइभ उपलब्धता हेर्छु।",
  domainHeading: (query) => `${query} को लाइभ जाँच:`,
  domainFailed:
    "अहिले डोमेन चेकरसँग सम्पर्क हुन सकेन। केही बेरपछि फेरि प्रयास गर्नुहोस् वा /domain-name-search खोल्नुहोस्।",
  domainEmpty: (query) =>
    `${query} का लागि कुनै नतिजा आएन। /domain-name-search मा फेरि जाँच्नुहोस्।`,
  domainFooter: (href) =>
    `उपलब्ध नाम दर्ता गर्न ${href} खोल्नुहोस्। यो च्याटबाट चेकआउट पूरा हुँदैन।`,
  hostingHeading: "यी HostingBeyond का लाइभ प्लान हुन्:",
  hostingNoCatalog:
    "अहिले लाइभ प्लान मूल्य पढ्न सकिएन। हालका प्लान र मूल्य /pricing मा छन् — म अनुमानले मूल्य भन्दिनँ।",
  hostingFooter:
    "तपाईं के बनाउँदै हुनुहुन्छ — WordPress, पसल, Node.js एप वा VPS — बताउनुहोस्, म सही प्लान देखाउँछु।",
  domainPriceHeading: (tlds) => `${tlds} का लाइभ डोमेन मूल्य:`,
  domainPriceNone:
    "लाइभ डोमेन मूल्य सूची पढ्न सकिएन। /domain-name-search मा हालको दर्ता, नवीकरण र स्थानान्तरण मूल्य देखिन्छ।",
  email:
    "आफ्नै डोमेनमा व्यवसायिक इमेल /business-email बाट सुरु हुन्छ। प्लान छान्नुहोस्, आफ्नो डोमेन जोड्नुहोस् वा यहीँ दर्ता गर्नुहोस्, त्यसपछि मेलबक्स नाम छान्नुहोस्। म मेलबक्स मूल्य वा MX रेकर्ड अनुमानले भन्दिनँ।",
  dns: "डोमेन प्यानलमा A, AAAA, CNAME, MX, TXT, NS र SRV रेकर्ड सम्पादन गर्न सकिन्छ (/account/my-domains)। प्यानलको पूर्वनिर्धारित TTL 3600 सेकेन्ड हो; MX र SRV मा प्राथमिकता पनि हुन्छ।\nसमीक्षाका लागि परिवर्तन तयार गर्न डोमेन, रेकर्ड प्रकार, होस्ट र मान बताउनुहोस्।",
  ssl: "SSL सूचीमा उल्लेख भएका सक्रिय HostingBeyond होस्टिङ प्लानमा समावेश छ। डोमेन हाम्रा नेमसर्भरमा आएपछि खाताको होस्टिङ सेवाबाट SSL जारी वा नवीकरण गर्नुहोस्। यो च्याटबाट SSL खोल्न सकिँदैन।",
  billing:
    "इनभ्वाइस, वालेट र भुक्तानी इतिहास लगइन गरेपछि तपाईंको HostingBeyond खाताको बिलिङ पृष्ठमा छन्। म ब्यालेन्स, इनभ्वाइस नम्बर वा रिफन्ड अनुमानले भन्दिनँ।",
  support:
    "यो च्याटबाट सहयोग अनुरोध तयार गर्न सक्छु। टिकट कार्डबाट तपाईंले पेस गर्नुपर्छ; म टिकट नम्बर बनाउँदिनँ र कुनै व्यक्ति अनलाइन छ भनी भन्दिनँ।",
  guestSignInForAccount:
    "आफ्नो डोमेन, होस्टिङ, इनभ्वाइस, अर्डर, DNS वा टिकट हेर्न HostingBeyond ग्राहक खातामा साइन इन गर्नुहोस्। लगइन बिना म केवल सार्वजनिक जानकारी दिन सक्छु — कुनै ग्राहकको निजी डेटा हेर्न वा पुष्टि गर्न सकिँदैन।",
  website:
    "नयाँ साइटका लागि /web-hosting बाट सुरु गर्नुहोस्, WordPress चाहिए /web-hosting/wordpress। चालु साइट बिग्रिएको छ भने डोमेन र ठ्याक्कै त्रुटि बताउनुहोस् — म DNS, SSL र होस्टिङ सेवा क्रममा हेर्छु।",
  fallback: (name) =>
    `${name ? `${name}, म` : "म"} डोमेन जाँच, होस्टिङ प्लान र मूल्य तुलना, व्यवसायिक इमेल, DNS वा SSL सहयोग, र वेबसाइट समस्या हेर्न सक्छु। कुन चाहियो बताउनुहोस्, वा example.com जस्तो नाम पठाउनुहोस्।`,
  statusAvailable: "उपलब्ध",
  statusTaken: "पहिले नै लिइएको",
  statusPremium: "प्रिमियम मूल्य",
  statusUnknown: "जाँच हुन सकेन",
  perYear: "प्रति वर्ष",
  perYearShort: "/वर्ष",
  from: "देखि",
  languageName: "नेपाली",
};

const ES: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `Hola ${name}.` : "Hola."} Dígame si quiere empezar con un dominio, hosting, correo profesional o su sitio web.`,
  askDomainName:
    "Indique el nombre que desea comprobar, por ejemplo bakery.com o bakery, y consultaré la disponibilidad en vivo.",
  domainHeading: (query) => `Comprobación en vivo para ${query}:`,
  domainFailed:
    "No pude contactar con el verificador de dominios. Inténtelo de nuevo o abra /domain-name-search.",
  hostingHeading: "Estos son los planes HostingBeyond en vivo:",
  billing:
    "Facturas y pagos están en su cuenta después de iniciar sesión. No inventaré saldos ni números de factura.",
  email:
    "El correo profesional en su propio dominio empieza en /business-email. Elija un plan, conecte un dominio que ya tenga o registre uno aquí, y luego elija el nombre del buzón. No inventaré direcciones de correo.",
  dns: "Los registros DNS se cambian desde la zona DNS del dominio en su cuenta tras iniciar sesión. No puedo ver ni modificar registros de una cuenta sin su sesión.",
  ssl: "SSL está incluido en los planes de hosting de HostingBeyond que lo indican. Emítalo o renuévelo desde el servicio de hosting después de apuntar el dominio a nuestros servidores de nombres.",
  website:
    "Para un sitio nuevo empiece en /web-hosting, o /web-hosting/wordpress si quiere WordPress. Si un sitio está caído, indique el dominio y el error exacto.",
  support:
    "Puedo preparar una solicitud de soporte; usted la envía con la tarjeta de ticket. No inventaré números de ticket.",
  fallback: (name) =>
    `${name ? `${name}, puedo` : "Puedo"} comprobar dominios, comparar hosting, correo, DNS o SSL. Dígame qué necesita o envíe un nombre como example.com.`,
  languageName: "Español",
};

const FR: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `Bonjour ${name}.` : "Bonjour."} Dites-moi si vous voulez un domaine, un hébergement, un e-mail pro ou un site web.`,
  domainHeading: (query) => `Vérification en direct pour ${query} :`,
  domainFailed:
    "Le vérificateur de domaines est indisponible pour le moment. Réessayez ou ouvrez /domain-name-search.",
  hostingHeading: "Voici les offres HostingBeyond en direct :",
  billing:
    "Factures et paiements sont dans votre compte après connexion. Je n'inventerai pas de solde ni de numéro de facture.",
  email:
    "L'e-mail professionnel sur votre propre domaine commence à /business-email. Choisissez une offre, connectez un domaine existant ou enregistrez-en un ici, puis choisissez le nom de la boîte. Je n'inventerai aucune adresse e-mail.",
  dns: "Les enregistrements DNS se modifient depuis la zone DNS du domaine dans votre compte après connexion. Je ne peux pas voir ni modifier les enregistrements d'un compte sans votre session.",
  ssl: "Le SSL est inclus sur les offres d'hébergement HostingBeyond qui le mentionnent. Émettez ou renouvelez-le depuis le service d'hébergement après avoir pointé le domaine vers nos serveurs de noms.",
  website:
    "Pour un nouveau site, commencez par /web-hosting, ou /web-hosting/wordpress pour WordPress. Si un site est en panne, indiquez le domaine et l'erreur exacte.",
  fallback: (name) =>
    `${name ? `${name}, je peux` : "Je peux"} vérifier un domaine, comparer l'hébergement, l'e-mail, le DNS ou le SSL. Dites-moi ce qu'il vous faut.`,
  languageName: "Français",
};

const AR: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `مرحبًا ${name}.` : "مرحبًا."} أخبرني إن كنت تريد نطاقًا أو استضافة أو بريدًا مهنيًا أو موقعًا.`,
  domainHeading: (query) => `فحص مباشر لـ ${query}:`,
  domainFailed:
    "تعذّر الاتصال بفاحص النطاقات الآن. حاول لاحقًا أو افتح /domain-name-search.",
  hostingHeading: "خطط HostingBeyond الحية:",
  billing:
    "الفواتير والمدفوعات في حسابك بعد تسجيل الدخول. لن أختلق أرقام فواتير أو أرصدة.",
  email:
    "البريد الإلكتروني للأعمال على نطاقك يبدأ من /business-email. اختر خطة، واربط نطاقًا تملكه أو سجّل واحدًا هنا، ثم اختر اسم صندوق البريد. لن أختلق أي عنوان بريد.",
  dns: "تُعدَّل سجلات DNS من منطقة DNS الخاصة بالنطاق في حسابك بعد تسجيل الدخول. لا يمكنني عرض أو تغيير سجلات أي حساب دون جلستك.",
  ssl: "شهادة SSL مشمولة في خطط الاستضافة التي تذكرها. أصدرها أو جدّدها من خدمة الاستضافة بعد توجيه النطاق إلى خوادم الأسماء لدينا.",
  website:
    "لموقع جديد ابدأ من /web-hosting، أو /web-hosting/wordpress لموقع ووردبريس. إذا كان الموقع معطلًا فأخبرني بالنطاق والخطأ بالضبط.",
  fallback: (name) =>
    `${name ? `${name}، يمكنني` : "يمكنني"} فحص نطاق أو مقارنة الاستضافة أو البريد أو DNS. أرسل اسمًا مثل example.com.`,
  languageName: "العربية",
};

const BN: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `নমস্কার ${name}.` : "নমস্কার."} ডোমেইন, হোস্টিং, ব্যবসায়িক ইমেইল বা ওয়েবসাইট — কী দিয়ে শুরু করতে চান বলুন।`,
  domainHeading: (query) => `${query} এর লাইভ যাচাই:`,
  domainFailed:
    "এখন ডোমেইন চেকারের সাথে যোগাযোগ হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন বা /domain-name-search খুলুন।",
  hostingHeading: "এগুলো HostingBeyond-এর লাইভ প্ল্যান:",
  billing:
    "ইনভয়েস ও পেমেন্ট সাইন-ইনের পর আপনার অ্যাকাউন্টে আছে। আমি ভুয়া ব্যালান্স বা ইনভয়েস নম্বর বলব না।",
  email:
    "নিজের ডোমেইনে ব্যবসায়িক ইমেইল /business-email থেকে শুরু হয়। একটা প্ল্যান বেছে নিন, আগের ডোমেইন যোগ করুন বা এখানেই রেজিস্টার করুন, তারপর মেইলবক্সের নাম দিন। আমি কোনো ইমেইল ঠিকানা বানিয়ে বলব না।",
  dns: "DNS রেকর্ড সাইন-ইনের পর আপনার অ্যাকাউন্টের ডোমেইনের DNS জোন থেকে বদলানো যায়। আপনার সেশন ছাড়া আমি কোনো অ্যাকাউন্টের রেকর্ড দেখতে বা বদলাতে পারি না।",
  ssl: "SSL সেই হোস্টিং প্ল্যানে অন্তর্ভুক্ত যেখানে উল্লেখ আছে। ডোমেইন আমাদের নেমসার্ভারে দিলে হোস্টিং সার্ভিস থেকে ইস্যু বা নবায়ন করুন।",
  website:
    "নতুন সাইটের জন্য /web-hosting থেকে শুরু করুন, ওয়ার্ডপ্রেস চাইলে /web-hosting/wordpress। সাইট ডাউন হলে ডোমেইন আর সঠিক ত্রুটিটা জানান।",
  fallback: (name) =>
    `${name ? `${name}, আমি` : "আমি"} ডোমেইন চেক, হোস্টিং তুলনা, ইমেইল, DNS বা SSL সাহায্য করতে পারি। example.com এর মতো নাম পাঠান।`,
  languageName: "বাংলা",
};

const DE: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `Hallo ${name}.` : "Hallo."} Sagen Sie mir, ob Sie eine Domain, Hosting, geschäftliche E-Mail oder eine Website brauchen.`,
  askDomainName:
    "Nennen Sie den gewünschten Namen, zum Beispiel bakery.com oder nur bakery, dann prüfe ich die Live-Verfügbarkeit.",
  domainHeading: (query) => `Live-Prüfung für ${query}:`,
  domainFailed:
    "Der Domain-Prüfer ist gerade nicht erreichbar. Versuchen Sie es erneut oder öffnen Sie /domain-name-search.",
  hostingHeading: "Das sind die aktuellen HostingBeyond-Tarife:",
  billing:
    "Rechnungen und Zahlungen finden Sie nach der Anmeldung in Ihrem Konto. Ich erfinde keine Beträge oder Rechnungsnummern.",
  support:
    "Ich kann eine Support-Anfrage vorbereiten; Sie senden sie über die Ticket-Karte. Ich erfinde keine Ticketnummern.",
  email:
    "Geschäftliche E-Mail auf Ihrer eigenen Domain beginnt bei /business-email. Wählen Sie einen Tarif, verbinden Sie eine bestehende Domain oder registrieren Sie hier eine, dann wählen Sie den Postfachnamen. Ich erfinde keine E-Mail-Adressen.",
  dns: "DNS-Einträge ändern Sie nach der Anmeldung in der DNS-Zone der Domain in Ihrem Konto. Ohne Ihre Sitzung kann ich keine Einträge eines Kontos sehen oder ändern.",
  ssl: "SSL ist in den HostingBeyond-Tarifen enthalten, die es ausweisen. Stellen Sie es im Hosting-Service aus, nachdem die Domain auf unsere Nameserver zeigt.",
  website:
    "Für eine neue Website starten Sie unter /web-hosting oder /web-hosting/wordpress für WordPress. Wenn eine Website nicht läuft, nennen Sie die Domain und den genauen Fehler.",
  fallback: (name) =>
    `${name ? `${name}, ich kann` : "Ich kann"} Domains prüfen, Hosting vergleichen sowie E-Mail, DNS oder SSL erklären. Sagen Sie mir, was Sie brauchen, oder senden Sie einen Namen wie example.com.`,
  languageName: "Deutsch",
};

const RU: Copy = {
  ...EN,
  greeting: (name) =>
    `${name ? `Здравствуйте, ${name}.` : "Здравствуйте."} Скажите, что вам нужно: домен, хостинг, корпоративная почта или сайт.`,
  askDomainName:
    "Назовите нужное имя, например bakery.com или просто bakery, и я проверю доступность в реальном времени.",
  domainHeading: (query) => `Проверка в реальном времени для ${query}:`,
  domainFailed:
    "Проверка доменов сейчас недоступна. Повторите попытку или откройте /domain-name-search.",
  hostingHeading: "Актуальные тарифы HostingBeyond:",
  billing:
    "Счета и платежи находятся в вашем аккаунте после входа. Я не буду выдумывать суммы или номера счетов.",
  support:
    "Я могу подготовить запрос в поддержку, вы отправите его через карточку тикета. Я не выдумываю номера тикетов.",
  email:
    "Корпоративная почта на вашем домене начинается с /business-email. Выберите тариф, подключите существующий домен или зарегистрируйте его здесь, затем выберите имя ящика. Я не выдумываю адреса почты.",
  dns: "DNS-записи меняются в DNS-зоне домена в вашем аккаунте после входа. Без вашей сессии я не могу видеть или менять записи аккаунта.",
  ssl: "SSL включён в тарифах хостинга, где он указан. Выпустите или продлите его в сервисе хостинга после перевода домена на наши серверы имён.",
  website:
    "Для нового сайта начните с /web-hosting или /web-hosting/wordpress для WordPress. Если сайт не работает, укажите домен и точную ошибку.",
  fallback: (name) =>
    `${name ? `${name}, я могу` : "Я могу"} проверить домен, сравнить хостинг и помочь с почтой, DNS или SSL. Скажите, что нужно, или отправьте имя вроде example.com.`,
  languageName: "Русский",
};

const BY_LANGUAGE: Record<AgentLanguage, Copy> = { en: EN, hi: HI, ne: NE };

export function agentCopy(language: AgentLanguage): Copy {
  return BY_LANGUAGE[language] ?? EN;
}

/** Locale-aware grounded copy with primary-language fallbacks. */
export function agentCopyForLocale(locale: ConversationLocale): Copy {
  const primary = primaryLanguageSubtag(locale);
  if (primary === "hi") return HI;
  if (primary === "ne") return NE;
  if (primary === "es") return ES;
  if (primary === "fr") return FR;
  if (primary === "ar") return AR;
  if (primary === "bn") return BN;
  if (primary === "de") return DE;
  if (primary === "ru") return RU;
  return EN;
}

export function statusLabel(
  locale: ConversationLocale | AgentLanguage,
  status: string,
): string {
  const copy =
    typeof locale === "string" && locale.includes("-")
      ? agentCopyForLocale(locale)
      : agentCopy(locale as AgentLanguage);
  if (status === "available") return copy.statusAvailable;
  if (status === "taken") return copy.statusTaken;
  if (status === "premium") return copy.statusPremium;
  return copy.statusUnknown;
}
