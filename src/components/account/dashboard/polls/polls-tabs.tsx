"use client";

import { useTranslations } from "next-intl";
import { FC, ReactNode } from "react";
import RouteTabs, { RouteTab } from "../route-tabs";

const PollsTabs: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations("account.dashboard.polls");

  const tabs: RouteTab[] = [
    { key: "my-polls", title: t("my_polls.title"), href: "/account/polls" },
    {
      key: "my-voting",
      title: t("my_votes.title"),
      href: "/account/polls/votes",
    },
    {
      key: "my-reactions",
      title: t("my_reactions.title"),
      href: "/account/polls/reactions",
    },
  ];

  return (
    <RouteTabs tabs={tabs} ariaLabel="Polls">
      {children}
    </RouteTabs>
  );
};

export default PollsTabs;
