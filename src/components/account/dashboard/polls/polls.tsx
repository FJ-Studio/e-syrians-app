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
          <CardBody>{t("my_votes.description")}</CardBody>
        </Card>
      </Tab>

      <Tab key="my-reactions" title={t("my_reactions.title")}>
        <Card>
          <CardBody>{t("my_reactions.description")}</CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};

export default Polls;
