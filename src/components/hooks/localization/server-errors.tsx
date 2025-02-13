import { useTranslations } from "next-intl";

const useServerError = (): ((errorCode: string) => string) => {
  const t = useTranslations("server_errors");
  return (errorCode: string) => {
    const errors = {
      basic_info_updates_limit_reached: t("basic_info_updates_limit_reached"),
    };
    return errors[errorCode as keyof typeof errors] || t("unknown_error");
  };
};

export default useServerError;
