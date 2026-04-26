import { useTranslations } from "next-intl";
import { FC } from "react";

const Fraudsters: FC = () => {
  const t = useTranslations("census.fraudsters");
  return (
    <>
      <h1 className="text-default-700 mb-2 text-3xl font-bold">{t("title")}</h1>
      <p>{t("description")}</p>
    </>
  );
};

export default Fraudsters;
