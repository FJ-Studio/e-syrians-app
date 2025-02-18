import { Poll } from "@/lib/types/polls";
import { FC } from "react";
import PollFullCard from "./cards/full";
import { useTranslations } from "next-intl";

type Props = {
  polls: Array<Poll>;
};

const Polls: FC<Props> = ({ polls }) => {
  const t = useTranslations("polls");
  return (
    <>
      <h1 className="font-bold text-3xl text-gray-700">{t("title")}</h1>
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-4 grid-flow-row dense	 my-4">
        {polls.map((poll) => (
          <PollFullCard key={poll.id} poll={poll} />
        ))}
      </div>
    </>
  );
};

export default Polls;
