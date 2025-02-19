"use client";
// import getYearsMonths from "@/lib/years-months";
// import { useTranslations } from "next-intl";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";
import { useEsyrian } from "../shared/contexts/es";
import { useTranslations } from "next-intl";

const PollsLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  const { openCensusForm } = useEsyrian();
  // const t = useTranslations();
  // const yearsMonths = getYearsMonths(2025, 2, [
  //   t("months.january"),
  //   t("months.february"),
  //   t("months.march"),
  //   t("months.april"),
  //   t("months.may"),
  //   t("months.june"),
  //   t("months.july"),
  //   t("months.august"),
  //   t("months.september"),
  //   t("months.october"),
  //   t("months.november"),
  //   t("months.december"),
  // ]);
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20 space-y-8">
      <div className="bg-primary h-12 flex items-center justify-between">
        <Container className="flex items-center justify-between text-white">
          <div>All</div>
          <button
            onClick={() => openCensusForm(true)}
            className="text-white bg-transparent border-0 hidden md:block"
          >
            {t("polls.actions.register")}
          </button>
        </Container>
      </div>
      <Container>{children}</Container>
    </div>
  );
};

export default PollsLayout;
