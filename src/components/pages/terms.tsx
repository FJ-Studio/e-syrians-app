import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FC } from "react";
import PageLayout from "./layout";

const Terms: FC = () => {
  const t = useTranslations("terms");
  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-default-800 mb-4 text-3xl font-bold">{t("title")}</h1>
        <p>{t("intro")}</p>
        <h3 className="text-default-800 mb-2 text-xl font-bold">1. {t("purpose.title")}</h3>
        <p>{t("purpose.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("purpose.items.item1.title")}</li>
          <li>{t("purpose.items.item2.title")}</li>
          <li>{t("purpose.items.item3.title")}</li>
        </ul>
        <h3 className="text-default-800 mb-2 text-xl font-bold">2. {t("eligibility.title")}</h3>
        <ul className="list-inside list-disc">
          <li>{t("eligibility.items.item1.title")}</li>
          <li>{t("eligibility.items.item2.title")}</li>
        </ul>
        <h3 className="text-default-800 mb-2 text-xl font-bold">3. {t("prohibited.title")}</h3>
        <p>{t("prohibited.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("prohibited.items.item1.title")}</li>
          <li>{t("prohibited.items.item2.title")}</li>
          <li>{t("prohibited.items.item3.title")}</li>
        </ul>
        <p>
          {t.rich("childSafety", {
            policy: (chunks) => (
              <Link href="/child-safety" className="text-primary underline underline-offset-4">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <h3 className="text-default-800 mb-2 text-xl font-bold">4. {t("dataUsage.title")}</h3>
        <p>
          {t.rich("dataUsage.description", {
            privacy: (c) => (
              <Link href="/privacy-policy" className="text-primary">
                {c}
              </Link>
            ),
          })}
        </p>
        <h3 className="text-default-800 mb-2 text-xl font-bold">5. {t("liability.title")}</h3>
        <p>{t("liability.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("liability.items.item1.title")}</li>
          <li>{t("liability.items.item2.title")}</li>
        </ul>
        <section
          id="identity-verification-purchases"
          aria-labelledby="identity-verification-purchases-title"
          className="scroll-mt-28 space-y-3"
        >
          <h3 id="identity-verification-purchases-title" className="text-default-800 text-xl font-bold">
            6. {t("identityVerification.title")}
          </h3>
          <p>{t("identityVerification.purchase")}</p>
          <p>{t("identityVerification.useAndGift")}</p>
          <p>
            {t.rich("identityVerification.verification", {
              privacy: (chunks) => (
                <Link
                  href="/privacy-policy#identity-verification"
                  className="text-primary underline underline-offset-4"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
          <h4 className="text-default-800 font-semibold">{t("identityVerification.refundTitle")}</h4>
          <p>{t("identityVerification.refunds")}</p>
          <p>{t("identityVerification.reversal")}</p>
          <p>
            {t.rich("identityVerification.request", {
              contact: (chunks) => (
                <a href="mailto:info@e-syrians.com" className="text-primary underline underline-offset-4" dir="ltr">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
        <h3 className="text-default-800 mb-2 text-xl font-bold">7. {t("contact.title")}</h3>
        <p>{t("contact.description")}</p>
        <p>
          {t("lastUpdate")}:{" "}
          <time dateTime="2026-11-13" dir="ltr">
            2026-11-13
          </time>
        </p>
      </div>
    </PageLayout>
  );
};

export default Terms;
