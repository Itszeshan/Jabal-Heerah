/**
 * Shop facts live here. Change the phone, hours, VAT, or social links
 * in this file, then redeploy. Do not add awards, reviews, or years in business.
 */
export const site = {
  name: {
    en: "Jabal Al Heerah Auto Paints",
    ar: "دهانات جبل الحيرة للسيارات",
  },
  /** The line under the name on the shop logo. */
  tagline: {
    en: "commitment to quality",
    ar: "الالتزام بالجودة",
  },
  domain: "jabalheerah.ae",
  url: "https://jabalheerah.ae",
  phoneDisplay: "+971 52 853 3654",
  phoneTel: "+971528533654",
  /** Digits only, no plus. Used for https://wa.me/ */
  whatsapp: "971528533654",
  address: {
    en: "161 Sheikh Khalifa Bin Zayed St, G Floor, Industrial Area 4, Sharjah, UAE",
    ar: "١٦١ شارع الشيخ خليفة بن زايد، الطابق الأرضي، المنطقة الصناعية ٤، الشارقة، الإمارات",
    streetAddress: "161 Sheikh Khalifa Bin Zayed St, G Floor",
    addressLocality: "Industrial Area 4",
    addressRegion: "Sharjah",
    addressCountry: "AE",
  },
  /**
   * Paste the Google Maps share link for the exact pin.
   * Until then, the map searches the street address.
   */
  mapPinUrl: "",
  mapQuery: "161 Sheikh Khalifa Bin Zayed St, Industrial Area 4, Sharjah, UAE",
  /**
   * Exact coordinates of the shop pin (Google Maps listing, matches 2GIS).
   * The map uses these first, because the street name also exists in Ajman.
   */
  geo: { latitude: 25.335618, longitude: 55.409276 } as { latitude: number; longitude: number } | null,
  hours: {
    /** Taken from the Google Maps listing for this shop. */
    placeholder: false,
    en: "Saturday to Thursday, 8 AM to 1 PM and 4 PM to 9 PM.\nFriday closed.",
    ar: "من السبت إلى الخميس، ٨ صباحاً إلى ١ ظهراً و٤ عصراً إلى ٩ مساءً.\nالجمعة مغلق.",
    /** One-line version for the bar above the header. */
    short: {
      en: "Sat to Thu, 8 AM to 1 PM and 4 PM to 9 PM",
      ar: "السبت إلى الخميس، ٨ صباحاً إلى ١ ظهراً و٤ عصراً إلى ٩ مساءً",
    },
  },
  /** true = prices already include 5% VAT. false = prices exclude 5% VAT. */
  pricesIncludeVat: false,
  vatRate: 0.05,
  socials: {
    facebook: "https://www.facebook.com/people/Jabal-Al-Heerah-Auto-Paints/61553530191955/",
    tiktok: "https://www.tiktok.com/@jabal_al_heerah_paints_1",
    /** Not live yet. Paste the profile URL when the account is ready. */
    instagram: "",
  },
  currency: "AED",
  pageSize: 24,
} as const;
