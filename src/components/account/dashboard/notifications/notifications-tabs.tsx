"use client";

import { useTranslations } from "next-intl";
import { FC, ReactNode } from "react";
import RouteTabs, { RouteTab } from "../route-tabs";

const NotificationsTabs: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations("account.dashboard.notifications");

  const tabs: RouteTab[] = [
    {
      key: "history",
      title: t("tabs.history"),
      href: "/account/notifications",
    },
    {
      key: "settings",
      title: t("tabs.settings"),
      href: "/account/notifications/settings",
    },
  ];

  return (
    <RouteTabs tabs={tabs} ariaLabel="Notifications">
      {children}
    </RouteTabs>
  );
};

export default NotificationsTabs;
