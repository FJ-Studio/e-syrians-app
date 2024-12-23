export const LOCALES = ["ar", "en", "ku"] as const;

export const LANGUAGES: Record<
  (typeof LOCALES)[number],
  {
    label: string;
  }
> = {
  ar: {
    label: "العربية",
  },
  en: {
    label: "English",
  },
  ku: {
    label: "Kurdî",
  },
};

export const MAP_KEY = process.env.NEXT_PUBLIC_MAP_KEY as string;
export const MAP_ID = '8baf23c678a7fb8f';
export const MAP_CENTER = { lat: 35.321, lng: 38.998 };

export const DEFAULT_LOCALE = "ar";

export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME as string;
export const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL as string;