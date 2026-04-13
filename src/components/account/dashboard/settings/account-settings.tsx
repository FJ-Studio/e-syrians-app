"use client";

import { Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import AccountNotification from "./notifications/notifications";
import AccountProfile from "./profile/profile";
import AccountSecurity from "./security-settings";

const AccountSettings: FC = () => {
  const t = useTranslations("account.settings");
  return (
    <Tabs>
      <Tab title={t("tabs.profile.title")}>
        <AccountProfile />
      </Tab>
      <Tab title={t("tabs.security.title")}>
        <AccountSecurity />
      </Tab>
      <Tab title={t("tabs.notifications.title")}>
        <AccountNotification />
      </Tab>
    </Tabs>
  );
};

export default AccountSettings;
