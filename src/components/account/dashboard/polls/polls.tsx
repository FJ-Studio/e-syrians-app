"use client";

import { Card, CardBody, Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import MyPolls from "./my-polls";

const Polls: FC = () => {
  const t = useTranslations("account.dashboard.polls");
  return (
    <Tabs aria-label="Options">
      <Tab key="my-polls" title={t("my_polls.title")}>
        <MyPolls />
      </Tab>
      <Tab key="my-answers" title={t("my_votes.title")}>
        <Card>
          <CardBody>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </CardBody>
        </Card>
      </Tab>

      <Tab key="my-reactions" title={t("my_reactions.title")}>
        <Card>
          <CardBody>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};

export default Polls;
