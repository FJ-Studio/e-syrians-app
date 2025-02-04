import { DailyRegistrations } from "@/lib/types/census";
import { useTranslations } from "next-intl";
import { FC } from "react";
import CensusCharts from "./charts/charts";
import CensusActions from "./actions";

type Props = {
  dailyRegistrations: DailyRegistrations;
};

const CensusMain: FC<Props> = () => {
  const t = useTranslations("census");
  return (
    <>
      <h1 className="font-bold text-3xl text-gray-700 mb-2">{t("title")}</h1>
      <p>{t("description")}</p>
      <CensusCharts />
      <CensusActions />
    </>
  );
};

export default CensusMain;
