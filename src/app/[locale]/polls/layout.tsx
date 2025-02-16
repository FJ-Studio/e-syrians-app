import PollsLayout from "@/components/polls/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PollsLayout>{children}</PollsLayout>;
}
