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
    // {
    //   title: t("violations.title"),
    //   description: t("violations.description"),
    //   link: "/violations",
    // },
  ];
};

export default useInitiatives;
