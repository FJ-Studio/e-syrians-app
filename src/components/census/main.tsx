import { useTranslations } from "next-intl";
import { FC } from "react";
import CensusCharts from "./charts/charts";
import CensusActions from "./actions";
import { Spacer } from "@heroui/react";

const CensusMain: FC = () => {
  const t = useTranslations("census");
  return (
    <>
      <h1 className="font-bold text-3xl text-gray-700 mb-2">{t("title")}</h1>
      <p className="mb-4">{t("description")}</p>
      <CensusCharts />
      <Spacer y={6} />
      <CensusActions />
      <Spacer y={6} />
    </>
  );
};

export default CensusMain;
