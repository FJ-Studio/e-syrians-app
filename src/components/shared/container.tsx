import { FC, PropsWithChildren } from "react";

interface ContainerProps extends PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {}

const Container: FC<ContainerProps> = ({ children, className, ...props }) => {
  return (
    <div className={`container mx-auto max-w-7xl px-4 lg:px-6 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export default Container;
