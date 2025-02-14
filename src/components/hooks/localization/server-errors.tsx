import { useTranslations } from "next-intl";

const useServerError = (): ((errorCode: string) => string) => {
  const t = useTranslations("server_errors");
  return (errorCode: string) => {
    const errors = {
      basic_info_updates_limit_reached: t("basic_info_updates_limit_reached"),
      country_updates_limit_reached: t("country_updates_limit_reached"),
      your_account_is_banned: t("your_account_is_banned"),
      you_are_not_verified: t("you_are_not_verified"),
      you_do_not_have_enough_verifications: t(
        "you_do_not_have_enough_verifications"
      ),
      you_have_reached_the_maximum_verifications: t(
        "you_have_reached_the_maximum_verifications"
      ),
      you_cannot_verify_yourself: t("you_cannot_verify_yourself"),
      circular_verification_not_allowed: t("circular_verification_not_allowed"),
      you_have_already_verified_this_user: t(
        "you_have_already_verified_this_user"
      ),
    };
    return errors[errorCode as keyof typeof errors] || t("unknown_error");
  };
};

export default useServerError;
