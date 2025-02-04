import { EducationLevel } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useEducationLevels = (): Record<EducationLevel, string> => {
  const t = useTranslations();
  return {
    none: t("education.none"),
    primary: t("education.primary"),
    secondary: t("education.secondary"),
    "high-school": t("education.high-school"),
    "university-degree": t("education.university-degree"),
    postgraduate: t("education.postgraduate"),
  };
};

export default useEducationLevels;
