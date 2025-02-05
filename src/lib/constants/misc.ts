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
export const MAP_STYLE = "mapbox://styles/mapbox/light-v11";
export const MAP_CENTER = { lat: 35.321, lng: 38.998 };

export const DEFAULT_LOCALE = "ar";

export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME as string;
export const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL as string;

export const X_URL = 'https://x.com/esyriansnetwork'
export const INSTAGRAM_URL = 'https://instagram.com/esyriansnetwork'

export const INITIATIVES = [
  {
    title: "initiatives.census.title",
    description: "initiatives.census.description",
    link: "/census",
  },
  {
    title: "initiatives.polls.title",
    description: "initiatives.polls.description",
    link: "/polls",
  },
  {
    title: "initiatives.disarmament.title",
    description: "initiatives.disarmament.description",
    link: "/disarm",
  },
];
