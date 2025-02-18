import Polls from "@/components/polls/polls";
import { getPolls } from "@/lib/api/requests";

export default async function PollsPage() {
  const year = new Date().getFullYear().toString();
  const month = (new Date().getMonth() + 1).toString();
  const polls = await getPolls(year, month);
  return <Polls polls={polls.data} />;
}
