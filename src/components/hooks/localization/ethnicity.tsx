import { Ethnicity } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useEthnicity = (): Record<Ethnicity, string> => {
  const t = useTranslations();
  return {
    arab: t("ethnicity.arab"),
    kurd: t("ethnicity.kurd"),
    turkmen: t("ethnicity.turkmen"),
    armenian: t("ethnicity.armenian"),
    greek: t("ethnicity.greek"),
    assyrian: t("ethnicity.assyrian"),
    chechen: t("ethnicity.chechen"),
    circassian: t("ethnicity.circassian"),
    other: t("ethnicity.other"),
  };
};

export default useEthnicity;
