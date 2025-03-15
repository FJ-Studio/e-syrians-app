import SinglePoll from "@/components/polls/single-poll";
import { getPoll } from "@/lib/api/requests";
import { Locale } from "@/lib/types/locale";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const poll = await getPoll(id);
  return {
    title: poll.data.question,
    openGraph: {
      title: poll.data.question,
    }
  }
}


export default async function SinglePollsPage({ params }: Props) {
  const { id } = await params;
  const poll = await getPoll(id);
  return <SinglePoll poll={poll.data} />;
}
