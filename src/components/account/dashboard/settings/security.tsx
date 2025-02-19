"use client";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const AccountSecurity: FC = () => {
  const t = useTranslations("account.dashboard.security");
  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <h2 className="text-xl font-medium text-default-700 text-start">
          {t("title")}
        </h2>
        <p className="text-default-500 text-start">{t("description")}</p>
      </CardHeader>
      <CardBody></CardBody>
    </Card>
  );
};

export default AccountSecurity;
