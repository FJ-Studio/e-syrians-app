export const APP_URL = "https://www.e-syrians.com";
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

export const DEFAULT_LOCALE = "ar";

export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME as string;
export const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL as string;

export const X_URL = "https://x.com/esyriansnetwork";
export const INSTAGRAM_URL = "https://instagram.com/esyriansnetwork";
export const FACEBOOK_URL = "https://www.facebook.com/esyriansnetwork";
