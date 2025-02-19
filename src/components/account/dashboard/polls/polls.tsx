"use client";

import { Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import MyPolls from "./my-polls";
import MyVoting from "./my-voting";
import MyReactions from "./my-reactions";

const Polls: FC = () => {
  const t = useTranslations("account.dashboard.polls");
  return (
    <Tabs aria-label="Options">
      <Tab key="my-polls" title={t("my_polls.title")}>
        <MyPolls />
      </Tab>
      <Tab key="my-voting" title={t("my_votes.title")}>
        <MyVoting />
      </Tab>
      <Tab key="my-reactions" title={t("my_reactions.title")}>
        <MyReactions />
      </Tab>
    </Tabs>
  );
};

export default Polls;
