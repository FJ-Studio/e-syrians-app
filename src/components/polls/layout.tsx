"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";

const PollsLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  return (
    <div className="relative min-h-[calc(100dvh-128px)] space-y-8 pt-20">
      <div className="bg-primary flex h-12 items-center justify-between">
        <Container className="text-primary-foreground flex items-center justify-between">
          <Link href="/polls" title={t("polls.categories.all")}>
            {t("polls.categories.all")}
          </Link>
        </Container>
      </div>
      <Container>{children}</Container>
    </div>
  );
};

export default PollsLayout;
