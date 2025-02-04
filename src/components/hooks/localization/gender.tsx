import { Gender } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useGender = (): Record<Gender, string> => {
  const t = useTranslations();
  return {
    f: t("gender.f"),
    m: t("gender.m"),
  };
};

export default useGender;
