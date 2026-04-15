"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import Container from "../shared/container";

const FeatureRequestsLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations("feature_requests");
  return (
    <div className="relative min-h-[calc(100dvh-128px)] space-y-8 pt-20">
      <div className="bg-primary flex h-12 items-center justify-between">
        <Container className="flex items-center justify-between text-white">
          <Link href="/feature-requests" title={t("title")}>
            {t("title")}
          </Link>
        </Container>
      </div>
      <Container>{children}</Container>
    </div>
  );
};

export default FeatureRequestsLayout;
