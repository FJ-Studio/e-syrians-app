import { SourceOfIncome } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useSourceOfIncome = (): Record<SourceOfIncome, string> => {
  const t = useTranslations();
  return {
    "stable-job": t("source-of-income.stable-job"),
    freelance: t("source-of-income.freelance"),
    "aid-support": t("source-of-income.aid-support"),
    "no-income": t("source-of-income.no-income"),
    other: t("source-of-income.other"),
  };
};

export default useSourceOfIncome;
