import { FC, PropsWithChildren } from "react";

const PageLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 mt-24 mb-8 ltr">
            {children}
        </div>
    )
};

export default PageLayout;