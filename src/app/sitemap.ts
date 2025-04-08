import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://e-syrians.com",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://e-syrians.com/ar",
          en: "https://e-syrians.com/en",
          ku: "https://e-syrians.com/ku",
        },
      },
    },
    {
      url: "https://e-syrians.com/faq",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://e-syrians.com/ar/faq",
          en: "https://e-syrians.com/en/faq",
          ku: "https://e-syrians.com/ku/faq",
        },
      },
    },
    {
      url: "https://e-syrians.com/census",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://e-syrians.com/ar/census",
          en: "https://e-syrians.com/en/census",
          ku: "https://e-syrians.com/ku/census",
        },
      },
    },
    {
      url: "https://e-syrians.com/polls",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://e-syrians.com/ar/polls",
          en: "https://e-syrians.com/en/polls",
          ku: "https://e-syrians.com/ku/polls",
        },
      },
    },
  ];
}
