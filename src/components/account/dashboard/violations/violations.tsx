"use client";
import UnderConstruction from "@/components/shared/under-construction";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const Violations: FC = () => {
  const t = useTranslations("account.dashboard.violations");
  return (
    <Card>
      <CardHeader>
        <h2 className="text-default-700 text-lg font-medium">{t("title")}</h2>
      </CardHeader>
      <CardBody>
        <p className="text-start">{t("description")}</p>
        <div className="border-default-100 bg-default-50 my-10 rounded-md border-1 py-10">
          <UnderConstruction />
        </div>
      </CardBody>
    </Card>
  );
};

export default Violations;
