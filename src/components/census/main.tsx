import { Spacer } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import CensusActions from "./actions";
import CensusCharts from "./charts/charts";

const CensusMain: FC = () => {
  const t = useTranslations("census");
  return (
    <>
      <h1 className="text-default-700 mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-4">{t("description")}</p>
      <CensusCharts />
      <Spacer y={6} />
      <CensusActions />
      <Spacer y={6} />
    </>
  );
};

export default CensusMain;
