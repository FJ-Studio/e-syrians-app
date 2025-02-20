import Polls from "@/components/polls/polls";
import { getPolls } from "@/lib/api/requests";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PollsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const year = searchParams.year || new Date().getFullYear().toString();
  const month = searchParams.month || (new Date().getMonth() + 1).toString();
  const page = searchParams.page || "1";
  const {
    data: { polls = [], current_page = 1, last_page = 1 },
  } = await getPolls(page as string, year as string, month as string);
  return (
    <Polls polls={polls} current_page={current_page} last_page={last_page} />
  );
}
