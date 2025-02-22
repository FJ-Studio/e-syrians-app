import { FC } from "react";
import { useTranslations } from "next-intl";
import Container from "../shared/container";

const PrivacyPolicy: FC = () => {
  const t = useTranslations("privacyPolicy");
  return (
    <Container className="py-28 text-start">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t("title")}</h1>
        <p>{t("intro")}</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          1. {t("dataCollection.title")}
        </h3>
        <p>{t("dataCollection.description")}:</p>
        <ul className="list-disc list-inside">
          <li>{t("dataCollection.items.item1.title")}</li>
          <li>{t("dataCollection.items.item2.title")}</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          2. {t("dataUsage.title")}
        </h3>
        <p>{t("dataUsage.description")}</p>
        <ul className="list-disc list-inside">
          <li>{t("dataUsage.items.item1.title")}</li>
          <li>{t("dataUsage.items.item2.title")}</li>
          <li>{t("dataUsage.items.item3.title")}</li>
          <li>{t("dataUsage.items.item4.title")}</li>
          <li>{t("dataUsage.items.item5.title")}</li>
          <li>{t("dataUsage.items.item6.title")}</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          3. {t("dataSharing.title")}
        </h3>
        <p>{t("dataSharing.description")}</p>
        <ul className="list-disc list-inside">
          <li>{t("dataSharing.items.item1.title")}</li>
          <li>{t("dataSharing.items.item2.title")}</li>
          <li>{t("dataSharing.items.item3.title")}</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          4. {t("dataProtection.title")}
        </h3>
        <p>{t("dataProtection.description")}</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          5. {t("dataProtectionRight.title")}
        </h3>
        <ul className="list-disc list-inside">
          <li>{t("dataProtection.items.item1.title")}</li>
          <li>{t("dataProtection.items.item2.title")}</li>
          <li>{t("dataProtection.items.item3.title")}</li>
          <li>{t("dataProtection.items.item4.title")}</li>
        </ul>
        <p>{t("dataProtectionRight.description")}</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          6. {t("contact.title")}
        </h3>
        <p>{t("contact.description")}</p>
        <p>
          {t("lastUpdate")}: <u>2025-02-21</u>
        </p>
      </div>
    </Container>
  );
};

export default PrivacyPolicy;
