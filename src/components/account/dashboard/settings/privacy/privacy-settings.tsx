"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const PrivacySettings: FC = () => {
  const t = useTranslations("account.dashboard.privacy");

  return (
    <>
      <h2 className="text-xl font-medium text-default-700 text-start">
        {t("title")}
      </h2>
      <p className="text-default-500 text-start">{t("description")}</p>
      <div className="mt-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3 py-8">
            <Icon
              icon="solar:lock-keyhole-bold"
              width={32}
              className="text-default-300"
            />
            <p className="text-default-400">{t("comingSoon")}</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default PrivacySettings;
