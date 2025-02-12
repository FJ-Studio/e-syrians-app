import { sortObject } from "@/lib/sort-object";
import { SpokenLanguage } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useSpokenLanguages = (): Record<SpokenLanguage, string> => {
  const t = useTranslations();
  return sortObject({
    arabic: t("spoken-language.arabic"),
    kurdish: t("spoken-language.kurdish"),
    chinese: t("spoken-language.chinese"),
    english: t("spoken-language.english"),
    french: t("spoken-language.french"),
    german: t("spoken-language.german"),
    hindi: t("spoken-language.hindi"),
    italian: t("spoken-language.italian"),
    dutch: t("spoken-language.dutch"),
    japanese: t("spoken-language.japanese"),
    korean: t("spoken-language.korean"),
    other: t("spoken-language.other"),
    persian: t("spoken-language.persian"),
    portuguese: t("spoken-language.portuguese"),
    russian: t("spoken-language.russian"),
    spanish: t("spoken-language.spanish"),
    turkish: t("spoken-language.turkish"),
    urdu: t("spoken-language.urdu"),
  });
};

export default useSpokenLanguages;
