import { useTranslations } from "next-intl";

const useInitiatives = () => {
  const t = useTranslations("initiatives");
  return [
    {
      title: t("census.title"),
      description: t("census.description"),
      link: "/census",
    },
    {
      title: t("polls.title"),
      description: t("polls.description"),
      link: "/polls",
    },
    {
      title: t("feature_requests.title"),
      description: t("feature_requests.description"),
      link: "/feature-requests",
    },
  ];
};

export default useInitiatives;
