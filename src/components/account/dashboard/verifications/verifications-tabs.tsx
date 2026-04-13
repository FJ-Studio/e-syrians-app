"use client";
import { Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import VerificationsTable from "./verifications-table";
import VerifiersTable from "./verifiers-table";

const VerificationsTabs: FC = () => {
  const t = useTranslations("account.dashboard.verifications");
  return (
    <Tabs aria-label="Options">
      <Tab key={"my-verifiers"} title={t("my-verifiers.title")}>
        <VerifiersTable />
      </Tab>
      <Tab key={"my-verifications"} title={t("my-verifications.title")}>
        <VerificationsTable />
      </Tab>
    </Tabs>
  );
};

export default VerificationsTabs;
