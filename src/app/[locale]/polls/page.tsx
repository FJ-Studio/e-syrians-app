import Polls from "@/components/polls/polls";
import { getPolls } from "@/lib/api/requests";

interface Props {
  searchParams: { page: string; year: string; month: string };
}

export default async function PollsPage({ searchParams }: Props) {
  const year = searchParams.year || new Date().getFullYear().toString();
  const month = searchParams.month || (new Date().getMonth() + 1).toString();
  const page = searchParams.page || "1";
  const {
    data: { polls = [], current_page = 1, last_page = 1 },
  } = await getPolls(page, year, month);
  return (
    <Polls polls={polls} current_page={current_page} last_page={last_page} />
  );
}
