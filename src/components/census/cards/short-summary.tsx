"use client";
import UserCardLinksDropdown from "@/components/account/public-verify/dropdown-items";
import useProvinces from "@/components/hooks/localization/provinces";
import { ESUser } from "@/lib/types/account";
import { Avatar, Card, CardBody } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type Props = {
  user: ESUser;
};

const ShortUserSummary: FC<Props> = ({ user }) => {
  const t = useTranslations();
  const provinces = useProvinces();
  return (
    <Card>
      <CardBody className="text-center">
        <div className="flex items-start justify-between">
          <div className="w-10"></div>
          <div className="flex w-full items-center justify-center pt-4">
            <Avatar src={user.avatar} size="lg" />
          </div>
          <UserCardLinksDropdown user={user} />
        </div>
        <p className="mt-2">{`${user.name} ${user.surname}`}</p>
        <p className="text-default-500 text-sm">
          {t("publicVerify.citizenFrom", {
            hometown: user?.hometown ? provinces[user.hometown] : "-",
            gender: user.gender ?? "",
          })}
        </p>
      </CardBody>
    </Card>
  );
};

export default ShortUserSummary;
