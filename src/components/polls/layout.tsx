import { FC, PropsWithChildren } from "react";

const PollsLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">{children}</div>
  );
};

export default PollsLayout;
