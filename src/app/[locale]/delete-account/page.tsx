import AccountDeletion from "@/components/pages/account-deletion";
import { APP_URL } from "@/lib/constants/misc";
import type { Locale } from "@/lib/types/locale";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const language = locale === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale: language, namespace: "accountDeletionPublic" });

  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: `${APP_URL}/${language}/delete-account`,
      languages: {
        ar: `${APP_URL}/ar/delete-account`,
        en: `${APP_URL}/en/delete-account`,
        "x-default": `${APP_URL}/en/delete-account`,
      },
    },
  };
}

export default function DeleteAccountPage() {
  return <AccountDeletion />;
}
