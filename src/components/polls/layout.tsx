"use client";
// import getYearsMonths from "@/lib/years-months";
// import { useTranslations } from "next-intl";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";

const PollsLayout: FC<PropsWithChildren> = ({ children }) => {
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
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">
      <div className="bg-primary h-12 flex items-center justify-between">
        <Container className="flex items-center justify-between text-white"></Container>
      </div>
      <Container>{children}</Container>
    </div>
  );
};

export default PollsLayout;
