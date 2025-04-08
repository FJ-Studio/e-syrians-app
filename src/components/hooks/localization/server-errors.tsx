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
      poll_has_expired: t("poll_has_expired"),
      poll_has_not_started_yet: t("poll_has_not_started_yet"),
      you_have_already_voted: t("you_have_already_voted"),
      user_is_not_in_poll_audience: t("user_is_not_in_poll_audience"),
      user_has_reached_the_max_selections: t(
        "user_has_reached_the_max_selections"
      ),
      invalid_options: t("invalid_options"),
      current_password_incorrect: t("current_password_incorrect"),
      failed_to_reset_password: t("failed_to_reset_password"),
      failed_to_send_password_reset_email: t(
        "failed_to_send_password_reset_email"
      ),
      invalid_verification_signature: t("invalid_verification_signature"),
      verification_signature_expired: t("verification_signature_expired"),
      invalid_verification_link: t("invalid_verification_link"),
      target_user_data_not_filled: t("target_user_data_not_filled"),
      unauthorized: t("unauthorized"),
      unauthenticated: t("unauthenticated"),
    };
    return errors[errorCode as keyof typeof errors] || t("unknown_error");
  };
};

export default useServerError;
