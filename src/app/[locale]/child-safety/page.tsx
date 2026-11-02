import ChildSafety from "@/components/pages/child-safety";
import { APP_URL } from "@/lib/constants/misc";
import { Locale } from "@/lib/types/locale";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "childSafety" });
  const canonicalLocale = locale === "ar" ? "ar" : "en";

  return {
    title: `${t("title")} | E-Syrians`,
    description: t("description"),
    alternates: {
      canonical: `${APP_URL}/${canonicalLocale}/child-safety`,
      languages: {
        ar: `${APP_URL}/ar/child-safety`,
        en: `${APP_URL}/en/child-safety`,
        "x-default": `${APP_URL}/en/child-safety`,
      },
    },
  };
}

export default function ChildSafetyPage() {
  return <ChildSafety />;
}
