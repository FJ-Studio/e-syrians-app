import { Spinner } from "@heroui/react";

export default function PollsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" color="primary" />
    </div>
  );
}
