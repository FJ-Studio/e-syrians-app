"use client";

import { Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import AccountProfile from "./profile/profile";
import AccountSecurity from "./security";

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
    </Tabs>
  );
};

export default AccountSettings;
