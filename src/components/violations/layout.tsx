"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";
import { useEsyrian } from "../shared/contexts/es";

const ViolationsLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  const { openCensusForm } = useEsyrian();
  return (
    <div className="relative min-h-[calc(100dvh-128px)] space-y-8 pt-20">
      <div className="bg-primary flex h-12 items-center justify-between">
        <Container className="flex items-center justify-between text-white">
          <Link href="/violations" title={t("violations.categories.all")}>
            {t("violations.categories.all")}
          </Link>
          <button onClick={() => openCensusForm(true)} className="block border-0 bg-transparent text-white">
            {t("polls.actions.register")}
          </button>
        </Container>
      </div>
      <Container>{children}</Container>
    </div>
  );
};

export default ViolationsLayout;
