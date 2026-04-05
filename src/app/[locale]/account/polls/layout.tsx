import PollsTabs from "@/components/account/dashboard/polls/polls-tabs";

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return <PollsTabs>{children}</PollsTabs>;
}
