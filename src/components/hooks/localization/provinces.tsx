import { Province } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useProvinces = (): Record<Province, string> => {
  const t = useTranslations();
  return {
    "deir-ezzor": t("province.deir-ezzor"),
    damascus: t("province.damascus"),
    hama: t("province.hama"),
    homs: t("province.homs"),
    idlib: t("province.idlib"),
    latakia: t("province.latakia"),
    aleppo: t("province.aleppo"),
    suwayda: t("province.suwayda"),
    "rif-dimashq": t("province.rif-dimashq"),
    daraa: t("province.daraa"),
    hasakah: t("province.hasakah"),
    quneitra: t("province.quneitra"),
    raqqa: t("province.raqqa"),
    tartus: t("province.tartus"),
  };
};

export default useProvinces;
