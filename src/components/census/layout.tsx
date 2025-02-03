import { FC, PropsWithChildren } from "react";

const CensusLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="container mx-auto max-w-7xl px-6 lg:px-8 min-h-screen pt-20">
      {children}
    </div>
  );
};

export default CensusLayout;
