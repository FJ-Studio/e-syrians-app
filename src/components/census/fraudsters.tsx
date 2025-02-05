import { useTranslations } from "next-intl";
import { FC } from "react";

const Fraudsters: FC = () => {
  const t = useTranslations("census.fraudsters");
  return (
    <>
      <h1 className="font-bold text-3xl text-gray-700 mb-2">{t("title")}</h1>
      <p>{t("description")}</p>
    </>
  );
};

export default Fraudsters;
