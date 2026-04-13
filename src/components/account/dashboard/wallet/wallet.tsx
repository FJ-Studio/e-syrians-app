"use client";
import UnderConstruction from "@/components/shared/under-construction";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const Wallet: FC = () => {
  const t = useTranslations("account.dashboard.wallet");
  return (
    <Card>
      <CardHeader>
        <h2 className="text-default-700 text-lg font-medium">{t("title")}</h2>
      </CardHeader>
      <CardBody>
        <p className="text-start">{t("description")}</p>
        <div className="my-10 rounded-md border-1 border-gray-100 bg-gray-50 py-10">
          <UnderConstruction />
        </div>
      </CardBody>
    </Card>
  );
};

export default Wallet;
