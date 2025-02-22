import { HealthStatus } from "@/lib/types/misc";
import { useTranslations } from "next-intl";

const useHealthStatuses = (): Record<HealthStatus, string> => {
  const t = useTranslations();
  return {
    good: t("health_status.good"),
    "chronic-illness": t("health_status.chronic-illness"),
    "disabled-special-needs": t("health_status.disabled-special-needs"),
  };
};

export default useHealthStatuses;
