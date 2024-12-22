import { useTranslations } from "next-intl";
import { FC } from "react";
import SupportMe from "./support";

const AboutMe: FC = () => {
  const t = useTranslations();
  return (
    <div className="m-auto max-w-7xl px-6 lg:px-8 mb-8">
      <div className="gap-14 lg:flex lg:items-center">
        <div className="relative w-full flex flex-col gap-8">
          <h1 className="text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl rtl:leading-tight">
            {t("home.about.title")}
          </h1>
          <p className="text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
            {t("home.about.description")}
          </p>
          <div className="flex justify-center"><SupportMe /></div>
          <p className="text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
          {t("home.about.esyrians")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
