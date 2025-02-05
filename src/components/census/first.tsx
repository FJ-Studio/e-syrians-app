import { useTranslations } from "next-intl";
import { FC } from "react";

const FirstRegistrants: FC = () => {
  const t = useTranslations("census.first");
  return (
    <>
      <h1 className="font-bold text-3xl text-gray-700 mb-2">{t("title")}</h1>
      <p>
        {t("description", {
          count: 100,
        })}
      </p>
    </>
  );
};

export default FirstRegistrants;
