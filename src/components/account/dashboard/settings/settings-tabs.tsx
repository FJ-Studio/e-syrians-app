"use client";

import { useTranslations } from "next-intl";
import { FC, ReactNode } from "react";
import RouteTabs, { RouteTab } from "../route-tabs";

const SettingsTabs: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations("account.settings");

  const tabs: RouteTab[] = [
    {
      key: "profile",
      title: t("tabs.profile.title"),
      href: "/account/settings",
    },
    {
      key: "security",
      title: t("tabs.security.title"),
      href: "/account/settings/security",
    },
    {
      key: "notifications",
      title: t("tabs.notifications.title"),
      href: "/account/settings/notifications",
    },
  ];

  return (
    <RouteTabs tabs={tabs} ariaLabel="Settings">
      {children}
    </RouteTabs>
  );
};

export default SettingsTabs;
