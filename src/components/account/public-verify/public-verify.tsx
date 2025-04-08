"use client";
import { ESUser } from "@/lib/types/account";
import { FC } from "react";
import UserAvatar from "./avatar";
import { useTranslations } from "next-intl";
import useProvinces from "@/components/hooks/localization/provinces";
import VerifyButton from "./verify-button";
import useGender from "@/components/hooks/localization/gender";
import useCountries from "@/components/hooks/localization/country";
import UserCardLinksDropdown from "./dropdown-items";
import { Card, CardBody } from "@heroui/react";

type Props = {
  user: ESUser;
};

const PublicVerify: FC<Props> = ({ user }) => {
  const t = useTranslations("publicVerify");
  const genders = useGender();
  // const ethnicities = useEthnicity();
  const provinces = useProvinces();
  const countries = useCountries();
  return (
    <>
      <h1 className="font-medium text-lg text-center text-default-700 mb-4">
        {t("title")}
      </h1>
      <Card className="max-w-md mx-auto">
        <CardBody className="space-y-4 text-start ">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className=" ">
                <p>{`${user?.name} ${user?.surname}`}</p>
                <p className="text-default-500 text-sm">
                  {t("citizenFrom", {
                    hometown: user?.hometown ? provinces[user?.hometown] : "-",
                    gender: user.gender,
                  })}
                </p>
              </div>
            </div>
            <UserCardLinksDropdown user={user} />
          </div>
          <div className="flex flex-wrap gap-y-2">
            <div className="flex flex-col  w-1/2 sm:w-1/3">
              <p>{t("birthdate")}</p>
              <p className="text-default-500 text-sm">{user.birth_date}</p>
            </div>
            <div className="flex flex-col w-1/2 sm:w-1/4">
              <p>{t("gender")}</p>
              <p className="text-default-500 text-sm">{user?.gender ? genders[user.gender] : '-'}</p>
            </div>
            {/* <div className="flex flex-col  w-1/2 sm:w-1/4">
              <p>{t("ethnicity")}</p>
              <p className="text-default-500 text-sm">
                {user.ethnicity ? ethnicities[user.ethnicity] : "-"}
              </p>
            </div> */}
            <div className="flex flex-col  w-1/2 sm:w-1/4">
              <p>{t("country")}</p>
              <p className="text-default-500 text-sm">
                {user.country ? countries[user.country] : "-"}
              </p>
            </div>
          </div>
          <VerifyButton user={user} />
        </CardBody>
      </Card>
    </>
  );
};

export default PublicVerify;
