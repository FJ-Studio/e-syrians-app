import { FC, PropsWithChildren } from "react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">
      <div className="bg-primary h-12 flex items-center justify-between">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8"></div>
      </div>
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
