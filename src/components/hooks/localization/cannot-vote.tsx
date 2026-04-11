import { useTranslations } from "next-intl";

const useCannotVoteReasons = () => {
  const t = useTranslations("cannot_vote_reasons");
  return {
    age: t("age"),
    country: t("country"),
    ethnicity: t("ethnicity"),
    gender: t("gender"),
    hometown: t("hometown"),
    religious_affiliation: t("religious_affiliation"),
    city_inside_syria: t("city_inside_syria"),
    not_in_allowed_voters: t("not_in_allowed_voters"),
    unauthorized: t("unauthorized"),
    not_in_audience: t("not_in_audience"),
    has_voted: t("has_voted"),
    poll_expired: t("poll_expired"),
  };
};

export default useCannotVoteReasons;
