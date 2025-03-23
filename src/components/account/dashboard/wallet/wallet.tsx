'use client'
import UnderConstruction from "@/components/shared/under-construction";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const Wallet: FC = () => {
    const t = useTranslations("account.dashboard.wallet");
    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg text-default-700 font-medium">{t("title")}</h2>
            </CardHeader>
            <CardBody>
                <p className="text-start">
                    {t("description")}
                </p>
                <div className="py-10 my-10 bg-gray-50 rounded-md border-gray-100 border-1">
                <UnderConstruction />
                </div>
            </CardBody>
        </Card>
    )
};

export default Wallet;