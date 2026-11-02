import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import PageLayout from "./layout";

const CONTACT_EMAIL = "info@e-syrians.com";
const UPDATED_AT = "2026-11-03";
const SECTION_IDS = ["scope", "prohibited", "reporting", "response", "privacy", "emergency", "contact"] as const;
const LINK_CLASS = "text-primary underline underline-offset-4";

export default function ChildSafety() {
  const t = useTranslations("childSafety");
  const locale = useLocale();
  const contentLocale = locale === "ar" ? "ar" : "en";

  return (
    <PageLayout>
      <article
        lang={contentLocale}
        dir={contentLocale === "ar" ? "rtl" : "ltr"}
        className="mx-auto max-w-3xl space-y-10 text-start leading-relaxed"
      >
        <header className="space-y-4">
          <h1 className="text-default-800 text-3xl font-bold">{t("title")}</h1>
          {locale === "ku" && <p className="text-default-600 text-sm">{t("fallbackNotice")}</p>}
          <p>
            {t.rich("intro", {
              brand: (chunks) => (
                <bdi dir="ltr" className="whitespace-nowrap">
                  {chunks}
                </bdi>
              ),
              operator: (chunks) => (
                <bdi dir="ltr" className="whitespace-nowrap">
                  {chunks}
                </bdi>
              ),
            })}
          </p>
          <p className="text-default-600 text-sm">
            {t("lastUpdated")}:{" "}
            <time dateTime={UPDATED_AT} dir="ltr">
              {UPDATED_AT}
            </time>
          </p>
        </header>

        <nav aria-label={t("onThisPage")} className="border-default-200 rounded-xl border p-5">
          <p className="mb-3 font-semibold">{t("onThisPage")}</p>
          <ul className="list-disc space-y-1 ps-5">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className={LINK_CLASS}>
                  {t(`${id}.title`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="scope" aria-labelledby="scope-title" className="scroll-mt-28 space-y-3">
          <h2 id="scope-title" className="text-default-800 text-xl font-bold">
            {t("scope.title")}
          </h2>
          <p>{t("scope.description")}</p>
          <p>{t("scope.age")}</p>
        </section>

        <section id="prohibited" aria-labelledby="prohibited-title" className="scroll-mt-28 space-y-3">
          <h2 id="prohibited-title" className="text-default-800 text-xl font-bold">
            {t("prohibited.title")}
          </h2>
          <p>{t("prohibited.intro")}</p>
          <ul className="list-disc space-y-2 ps-5">
            <li>{t("prohibited.material")}</li>
            <li>{t("prohibited.grooming")}</li>
            <li>{t("prohibited.exploitation")}</li>
          </ul>
        </section>

        <section id="reporting" aria-labelledby="reporting-title" className="scroll-mt-28 space-y-3">
          <h2 id="reporting-title" className="text-default-800 text-xl font-bold">
            {t("reporting.title")}
          </h2>
          <p>{t("reporting.intro")}</p>
          <ol className="list-decimal space-y-2 ps-5">
            <li>{t("reporting.reason")}</li>
            <li>{t("reporting.details")}</li>
          </ol>
          <p className="font-semibold">{t("reporting.noCopies")}</p>
          <p>
            {t.rich("reporting.alternative", {
              contact: (chunks) => (
                <a href="#contact" className={LINK_CLASS}>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>

        <section id="response" aria-labelledby="response-title" className="scroll-mt-28 space-y-3">
          <h2 id="response-title" className="text-default-800 text-xl font-bold">
            {t("response.title")}
          </h2>
          <p>{t("response.review")}</p>
          <p>{t("response.action")}</p>
          <p>{t("response.authorities")}</p>
        </section>

        <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-28 space-y-3">
          <h2 id="privacy-title" className="text-default-800 text-xl font-bold">
            {t("privacy.title")}
          </h2>
          <p>
            {t.rich("privacy.description", {
              policy: (chunks) => (
                <Link href="/privacy-policy" className={LINK_CLASS}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <section id="emergency" aria-labelledby="emergency-title" className="scroll-mt-28 space-y-3">
          <h2 id="emergency-title" className="text-default-800 text-xl font-bold">
            {t("emergency.title")}
          </h2>
          <p>{t("emergency.description")}</p>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-28 space-y-3">
          <h2 id="contact-title" className="text-default-800 text-xl font-bold">
            {t("contact.title")}
          </h2>
          <p>{t("contact.description")}</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className={LINK_CLASS}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>{t("contact.instructions")}</p>
        </section>

        <p className="border-default-200 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6">
          <Link href="/privacy-policy" className={LINK_CLASS}>
            {t("privacyPolicy")}
          </Link>
          <Link href="/terms" className={LINK_CLASS}>
            {t("terms")}
          </Link>
        </p>
      </article>
    </PageLayout>
  );
}
