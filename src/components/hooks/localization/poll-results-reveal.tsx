import { PollReveal } from "@/lib/types/polls";
import { useTranslations } from "next-intl";

const usePollResultsReveal = (): Record<
  PollReveal,
  { title: string; description: string }
> => {
  const t = useTranslations();
  return {
    "before-voting": {
      title: t("poll-results-reveal.before-voting.title"),
      description: t("poll-results-reveal.before-voting.description"),
    },

    "after-voting": {
      title: t("poll-results-reveal.after-voting.title"),
      description: t("poll-results-reveal.after-voting.description"),
    },
    "after-expiration": {
      title: t("poll-results-reveal.after-expiration.title"),
      description: t("poll-results-reveal.after-expiration.description"),
    },
  };
};

export default usePollResultsReveal;
