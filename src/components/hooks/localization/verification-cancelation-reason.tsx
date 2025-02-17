import { useTranslations } from "next-intl";

const useVerificationCancelationReason = (): ((
  reasonCode: string
) => string) => {
  const t = useTranslations("verificationCancelationReasons");
  return (reasonCode: string) => {
    const reasons = {
      user_updated_basic_info: t("user_updated_basic_info"),
    };
    return reasons[reasonCode as keyof typeof reasons] || t("unknown_reason");
  };
};

export default useVerificationCancelationReason;
