import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import PageLayout from "./layout";

const SUPPORT_EMAIL = "info@e-syrians.com";
const LINK_CLASS = "text-primary font-medium underline underline-offset-4";

export default function AccountDeletion() {
  const locale = useLocale();
  const t = useTranslations("accountDeletionPublic");
  const language = locale === "ar" ? "ar" : "en";
  const emailLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t("emailSubject"))}`;

  return (
    <PageLayout>
      <article lang={language} dir={language === "ar" ? "rtl" : "ltr"} className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          {locale === "ku" && <p className="text-default-600 text-sm">{t("fallbackNotice")}</p>}
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p>{t("intro")}</p>
        </header>

        <section aria-labelledby="deletion-request" className="space-y-3">
          <h2 id="deletion-request" className="text-xl font-semibold">
            {t("request.title")}
          </h2>
          <p>{t("request.emailInstructions")}</p>
          <a href={emailLink} className={LINK_CLASS}>
            {t("request.emailAction")}
          </a>
          <p className="text-default-600 text-sm">
            <bdi>{SUPPORT_EMAIL}</bdi> — {t("request.verify")}
          </p>
        </section>

        <section aria-labelledby="deletion-self-service" className="space-y-3">
          <h2 id="deletion-self-service" className="text-xl font-semibold">
            {t("selfService.title")}
          </h2>
          <p>{t("selfService.instructions")}</p>
          <Link href="/account/settings/security" className={LINK_CLASS}>
            {t("selfService.action")}
          </Link>
          <p>{t("selfService.grace")}</p>
        </section>

        <section aria-labelledby="deletion-data" className="space-y-3">
          <h2 id="deletion-data" className="text-xl font-semibold">
            {t("data.title")}
          </h2>
          <p>{t("data.deleted")}</p>
          <p>{t("data.retained")}</p>
          <Link href="/privacy-policy" className={LINK_CLASS}>
            {t("data.privacy")}
          </Link>
        </section>
      </article>
    </PageLayout>
  );
}
