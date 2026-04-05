"use client";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";
import { useEsyrian } from "../shared/contexts/es";
import { useTranslations } from "next-intl";
import Link from "next/link";

const PollsLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  const { openCensusForm } = useEsyrian();
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20 space-y-8">
      <div className="bg-primary h-12 flex items-center justify-between">
        <Container className="flex items-center justify-between text-white">
          <Link href="/polls" title={t("polls.categories.all")}>
            {t("polls.categories.all")}
          </Link>
          <button
            onClick={() => openCensusForm(true)}
            className="text-white bg-transparent border-0 block"
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
