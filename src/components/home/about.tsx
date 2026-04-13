import { useTranslations } from "next-intl";
import { FC } from "react";
import SupportMe from "./support";

const AboutMe: FC = () => {
  const t = useTranslations();
  return (
    <div className="m-auto mb-8 max-w-7xl px-6 lg:px-8">
      <div className="gap-14 lg:flex lg:items-center">
        <div className="relative flex w-full flex-col gap-8">
          <h1 className="text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-7xl rtl:leading-tight">
            {t("home.about.title")}
          </h1>
          <p className="text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">{t("home.about.description")}</p>
          <div className="flex justify-center">
            <SupportMe />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
