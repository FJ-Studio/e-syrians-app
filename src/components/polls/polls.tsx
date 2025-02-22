import { Poll } from "@/lib/types/polls";
import { FC } from "react";
import { useTranslations } from "next-intl";
import PollPagination from "./polls-pagination";
import { Spacer } from "@heroui/react";
import PollsFilter from "./polls-filter";
import PollFullCard from "./cards/poll-card";

type Props = {
  polls: Array<Poll>;
  current_page: number;
  last_page: number;
};

const Polls: FC<Props> = ({ current_page, last_page, polls }) => {
  const t = useTranslations("polls");
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-bold text-3xl text-gray-700">{t("title")}</h1>
        <PollsFilter />
      </div>
      <p className="mb-4">{t("description")}</p>
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {(polls ?? []).map((poll) => (
          <PollFullCard key={poll.id} poll={poll} />
        ))}
      </div>
      <Spacer y={4} />
      {polls.length > 0 ? (
        <PollPagination page={current_page} last_page={last_page} />
      ) : (
        <div className="justify-center text-center my-10">
          <p className="font-medium text-lg">{t("noPolls.title")}</p>
          <p>{t("noPolls.description")}</p>
        </div>
      )}
      <Spacer y={4} />
    </>
  );
};

export default Polls;
