import { ReligiousAffiliation } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useReligiousAffiliation = (): Record<ReligiousAffiliation, string> => {
  const t = useTranslations();
  return {
    sunni: t("religious_affiliation.sunni"),
    shia: t("religious_affiliation.shia"),
    alawites: t("religious_affiliation.alawites"),
    druze: t("religious_affiliation.druze"),
    ismailis: t("religious_affiliation.ismailis"),
    "armenian-catholic": t("religious_affiliation.armenian-catholic"),
    "armenian-orthodox": t("religious_affiliation.armenian-orthodox"),
    "assyrian-church-of-the-east": t(
      "religious_affiliation.assyrian-chaldean-syriac"
    ),
    "greek-catholic": t("religious_affiliation.greek-catholic"),
    "greek-orthodox": t("religious_affiliation.greek-orthodox"),
    protestant: t("religious_affiliation.protestant"),
    "syriac-catholic": t("religious_affiliation.syriac-catholic"),
    "syriac-orthodox": t("religious_affiliation.syriac-orthodox"),
    maronites: t("religious_affiliation.maronites"),
    yazidis: t("religious_affiliation.yazidis"),
    jews: t("religious_affiliation.jews"),
    "non-religious": t("religious_affiliation.non-religious"),
    other: t("religious_affiliation.other"),
  };
};

export default useReligiousAffiliation;
