import { Poll } from "@/lib/types/polls";
import { FC } from "react";
import PollFullCard from "./cards/poll-card";

type Props = {
  poll: Poll;
};
const SinglePoll: FC<Props> = ({ poll }) => {
  return (
    <div className="max-w-lg mx-auto">
      <PollFullCard poll={poll} />
    </div>
  );
};

export default SinglePoll;
