import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.e-syrians.com",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar",
          en: "https://www.e-syrians.com/en",
          ku: "https://www.e-syrians.com/ku",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/faq",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/faq",
          en: "https://www.e-syrians.com/en/faq",
          ku: "https://www.e-syrians.com/ku/faq",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/census",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/census",
          en: "https://www.e-syrians.com/en/census",
          ku: "https://www.e-syrians.com/ku/census",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/polls",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/polls",
          en: "https://www.e-syrians.com/en/polls",
          ku: "https://www.e-syrians.com/ku/polls",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/auth/sign-in",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/auth/sign-in",
          en: "https://www.e-syrians.com/en/auth/sign-in",
          ku: "https://www.e-syrians.com/ku/auth/sign-in",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/terms",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/terms",
          en: "https://www.e-syrians.com/en/terms",
          ku: "https://www.e-syrians.com/ku/terms",
        },
      },
    },
    {
      url: "https://www.e-syrians.com/privacy-policy",
      lastModified: new Date(),
      alternates: {
        languages: {
          ar: "https://www.e-syrians.com/ar/privacy-policy",
          en: "https://www.e-syrians.com/en/privacy-policy",
          ku: "https://www.e-syrians.com/ku/privacy-policy",
        },
      },
    },
  ];
}
