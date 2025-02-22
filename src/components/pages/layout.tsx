import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";

const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Container className="py-28 text-start">{children}</Container>;
};

export default PageLayout;
