import { Poll } from "@/lib/types/polls";
import { Spacer } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import PollFullCard from "./cards/poll-card";
import PollsFilter from "./polls-filter";
import PollPagination from "./polls-pagination";

type Props = {
  polls: Array<Poll>;
  current_page: number;
  last_page: number;
};

const Polls: FC<Props> = ({ current_page, last_page, polls }) => {
  const t = useTranslations("polls");
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-700">{t("title")}</h1>
        <PollsFilter />
      </div>
      <p className="mb-4">{t("description")}</p>
      <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(polls ?? []).map((poll) => (
          <PollFullCard key={poll.id} poll={poll} />
        ))}
      </div>
      <Spacer y={4} />
      {polls.length > 0 ? (
        <PollPagination page={current_page} last_page={last_page} />
      ) : (
        <div className="my-10 justify-center text-center">
          <p className="text-lg font-medium">{t("noPolls.title")}</p>
          <p>{t("noPolls.description")}</p>
        </div>
      )}
      <Spacer y={4} />
    </>
  );
};

export default Polls;
