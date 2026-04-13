import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";
import PageLayout from "./layout";

const Terms: FC = () => {
  const t = useTranslations("terms");
  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{t("title")}</h1>
        <p>{t("intro")}</p>
        <h3 className="mb-2 text-xl font-bold text-gray-800">1. {t("purpose.title")}</h3>
        <p>{t("purpose.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("purpose.items.item1.title")}</li>
          <li>{t("purpose.items.item2.title")}</li>
          <li>{t("purpose.items.item3.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">2. {t("eligibility.title")}</h3>
        <ul className="list-inside list-disc">
          <li>{t("eligibility.items.item1.title")}</li>
          <li>{t("eligibility.items.item2.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">3. {t("prohibited.title")}</h3>
        <p>{t("prohibited.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("prohibited.items.item1.title")}</li>
          <li>{t("prohibited.items.item2.title")}</li>
          <li>{t("prohibited.items.item3.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">4. {t("dataUsage.title")}</h3>
        <p>
          {t.rich("dataUsage.description", {
            privacy: (c) => (
              <Link href="/privacy-policy" className="text-primary">
                {c}
              </Link>
            ),
          })}
        </p>
        <h3 className="mb-2 text-xl font-bold text-gray-800">5. {t("liability.title")}</h3>
        <p>{t("liability.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("liability.items.item1.title")}</li>
          <li>{t("liability.items.item2.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">6. {t("contact.title")}</h3>
        <p>{t("contact.description")}</p>
        <p>
          {t("lastUpdate")}: <u>2025-02-22</u>
        </p>
      </div>
    </PageLayout>
  );
};

export default Terms;
