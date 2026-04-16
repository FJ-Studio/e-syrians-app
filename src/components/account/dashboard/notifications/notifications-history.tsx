"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const NotificationsHistory: FC = () => {
  const t = useTranslations("account.dashboard.notifications");

  return (
    <Card>
      <CardHeader className="text-default-700 font-medium">{t("history.title")}</CardHeader>
      <CardBody className="flex flex-col items-start">
        <p className="text-default-500">{t("history.empty")}</p>
      </CardBody>
    </Card>
  );
};

export default NotificationsHistory;
