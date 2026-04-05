import { useTranslations } from "next-intl";

const useServerError = (): ((errorCode: string) => string) => {
  const t = useTranslations("server_errors");
  return (errorCode: string) => {
    const errors = {
      // Auth
      unauthenticated: t("unauthenticated"),
      unauthorized: t("unauthorized"),
      logged_out: t("logged_out"),
      user_already_verified: t("user_already_verified"),
      verification_email_sent: t("verification_email_sent"),
      email_verified: t("email_verified"),

      // Password
      current_password_incorrect: t("current_password_incorrect"),
      password_updated: t("password_updated"),
      reset_link_sent: t("reset_link_sent"),
      failed_to_send_password_reset_email: t(
        "failed_to_send_password_reset_email"
      ),
      failed_to_reset_password: t("failed_to_reset_password"),
      password_reset_successfully: t("password_reset_successfully"),

      // Profile
      email_changed: t("email_changed"),
      notifications_changed: t("notifications_changed"),
      language_updated: t("language_updated"),
      invalid_file_type: t("invalid_file_type"),
      basic_info_updates_limit_reached: t("basic_info_updates_limit_reached"),
      country_updates_limit_reached: t("country_updates_limit_reached"),

      // Verification
      your_account_is_banned: t("your_account_is_banned"),
      you_are_not_verified: t("you_are_not_verified"),
      you_do_not_have_enough_verifications: t(
        "you_do_not_have_enough_verifications"
      ),
      you_have_reached_the_maximum_verifications: t(
        "you_have_reached_the_maximum_verifications"
      ),
      you_have_made_a_lot_of_verifications: t(
        "you_have_made_a_lot_of_verifications"
      ),
      you_cannot_verify_yourself: t("you_cannot_verify_yourself"),
      circular_verification_not_allowed: t("circular_verification_not_allowed"),
      you_have_already_verified_this_user: t(
        "you_have_already_verified_this_user"
      ),
      target_user_data_not_filled: t("target_user_data_not_filled"),
      user_not_found: t("user_not_found"),
      target_user_not_found: t("target_user_not_found"),
      user_is_banned: t("user_is_banned"),

      // Poll
      poll_has_not_started_yet: t("poll_has_not_started_yet"),
      poll_has_expired: t("poll_has_expired"),
      you_have_already_voted: t("you_have_already_voted"),
      user_is_not_in_poll_audience: t("user_is_not_in_poll_audience"),
      user_has_reached_the_max_selections: t(
        "user_has_reached_the_max_selections"
      ),
      invalid_options: t("invalid_options"),
      voters_not_visible: t("voters_not_visible"),

      // Verification links
      invalid_verification_signature: t("invalid_verification_signature"),
      verification_signature_expired: t("verification_signature_expired"),
      invalid_verification_link: t("invalid_verification_link"),

      // Security
      recaptcha_token_required: t("recaptcha_token_required"),
      recaptcha_verification_failed: t("recaptcha_verification_failed"),

      // Audience eligibility
      birth_date_missing: t("audience_birth_date_missing"),
      age_min: t("audience_age_min"),
      age_max: t("audience_age_max"),
      country_missing: t("audience_country_missing"),
      country: t("audience_country"),
      religious_affiliation_missing: t("audience_religious_affiliation_missing"),
      religious_affiliation: t("audience_religious_affiliation"),
      hometown_missing: t("audience_hometown_missing"),
      hometown: t("audience_hometown"),
      gender_missing: t("audience_gender_missing"),
      gender: t("audience_gender"),
      ethnicity_missing: t("audience_ethnicity_missing"),
      ethnicity: t("audience_ethnicity"),

      // Misc
      not_implemented: t("not_implemented"),
    };
    return errors[errorCode as keyof typeof errors] || errorCode;
  };
};

export default useServerError;
