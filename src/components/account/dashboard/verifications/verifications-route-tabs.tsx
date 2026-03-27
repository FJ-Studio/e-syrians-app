"use client";

import { useTranslations } from "next-intl";
import { FC, ReactNode } from "react";
import RouteTabs, { RouteTab } from "../route-tabs";

const VerificationsRouteTabs: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations("account.dashboard.verifications");

  const tabs: RouteTab[] = [
    {
      key: "my-verifiers",
      title: t("my-verifiers.title"),
      href: "/account/verifications",
    },
    {
      key: "my-verifications",
      title: t("my-verifications.title"),
      href: "/account/verifications/sent",
    },
  ];

  return (
    <RouteTabs tabs={tabs} ariaLabel="Verifications">
      {children}
    </RouteTabs>
  );
};

export default VerificationsRouteTabs;
