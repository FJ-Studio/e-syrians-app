import { useTranslations } from "next-intl";
import { FC } from "react";
import PageLayout from "./layout";

const PrivacyPolicy: FC = () => {
  const t = useTranslations("privacyPolicy");
  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{t("title")}</h1>
        <p>{t("intro")}</p>
        <h3 className="mb-2 text-xl font-bold text-gray-800">1. {t("dataCollection.title")}</h3>
        <p>{t("dataCollection.description")}:</p>
        <ul className="list-inside list-disc">
          <li>{t("dataCollection.items.item1.title")}</li>
          <li>{t("dataCollection.items.item2.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">2. {t("dataUsage.title")}</h3>
        <p>{t("dataUsage.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("dataUsage.items.item1.title")}</li>
          <li>{t("dataUsage.items.item2.title")}</li>
          <li>{t("dataUsage.items.item3.title")}</li>
          <li>{t("dataUsage.items.item4.title")}</li>
          <li>{t("dataUsage.items.item5.title")}</li>
          <li>{t("dataUsage.items.item6.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">3. {t("dataSharing.title")}</h3>
        <p>{t("dataSharing.description")}</p>
        <ul className="list-inside list-disc">
          <li>{t("dataSharing.items.item1.title")}</li>
          <li>{t("dataSharing.items.item2.title")}</li>
          <li>{t("dataSharing.items.item3.title")}</li>
        </ul>
        <h3 className="mb-2 text-xl font-bold text-gray-800">4. {t("dataProtection.title")}</h3>
        <p>{t("dataProtection.description")}</p>
        <h3 className="mb-2 text-xl font-bold text-gray-800">5. {t("dataProtectionRight.title")}</h3>
        <ul className="list-inside list-disc">
          <li>{t("dataProtection.items.item1.title")}</li>
          <li>{t("dataProtection.items.item2.title")}</li>
          <li>{t("dataProtection.items.item3.title")}</li>
          <li>{t("dataProtection.items.item4.title")}</li>
        </ul>
        <p>{t("dataProtectionRight.description")}</p>
        <h3 className="mb-2 text-xl font-bold text-gray-800">6. {t("contact.title")}</h3>
        <p>{t("contact.description")}</p>
        <p>
          {t("lastUpdate")}: <u>2025-02-21</u>
        </p>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
