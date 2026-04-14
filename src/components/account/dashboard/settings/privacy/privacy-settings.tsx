"use client";

import { Card, CardBody } from "@heroui/react";
import lockKeyholeIcon from "@iconify-icons/solar/lock-keyhole-bold";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const PrivacySettings: FC = () => {
  const t = useTranslations("account.dashboard.privacy");

  return (
    <>
      <h2 className="text-default-700 text-start text-xl font-medium">{t("title")}</h2>
      <p className="text-default-500 text-start">{t("description")}</p>
      <div className="mt-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3 py-8">
            <Icon icon={lockKeyholeIcon} width={32} height={32} className="text-default-300" />
            <p className="text-default-400">{t("comingSoon")}</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default PrivacySettings;
