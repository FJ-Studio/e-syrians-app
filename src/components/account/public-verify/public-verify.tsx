"use client";
import useCountries from "@/components/hooks/localization/country";
import useGender from "@/components/hooks/localization/gender";
import useProvinces from "@/components/hooks/localization/provinces";
import { ESUser } from "@/lib/types/account";
import { Card, CardBody } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import UserAvatar from "./avatar";
import UserCardLinksDropdown from "./dropdown-items";
import VerifyButton from "./verify-button";

type Props = {
  user: ESUser;
};

const PublicVerify: FC<Props> = ({ user }) => {
  const t = useTranslations("publicVerify");
  const genders = useGender();
  const provinces = useProvinces();
  const countries = useCountries();
  return (
    <>
      <h1 className="text-default-700 mb-4 text-center text-lg font-medium">{t("title")}</h1>
      <Card className="mx-auto max-w-md">
        <CardBody className="space-y-4 text-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className=" ">
                <p>{`${user?.name} ${user?.surname}`}</p>
                <p className="text-default-500 text-sm">
                  {t("citizenFrom", {
                    hometown: user?.hometown ? provinces[user?.hometown] : "-",
                    gender: user.gender ?? "",
                  })}
                </p>
              </div>
            </div>
            <UserCardLinksDropdown user={user} />
          </div>
          <div className="flex flex-wrap gap-y-2">
            {/*
              Birth YEAR only — the full `birth_date` was a privacy
              leak on a public, unauthenticated, deep-linkable page
              (it's a common identity-challenge field at banks /
              gov agencies / etc.). Backend dropped `birth_date`
              from the always-public block of UserResource.php on
              2026-06 and added a derived `birth_year` field for
              age-cohort signal that has no challenge value.
            */}
            <div className="flex w-1/2 flex-col sm:w-1/3">
              <p>{t("bornIn")}</p>
              <p className="text-default-500 text-sm">{user.birth_year ?? "-"}</p>
            </div>
            <div className="flex w-1/2 flex-col sm:w-1/4">
              <p>{t("gender")}</p>
              <p className="text-default-500 text-sm">{user?.gender ? genders[user.gender] : "-"}</p>
            </div>
            {/* <div className="flex flex-col  w-1/2 sm:w-1/4">
              <p>{t("ethnicity")}</p>
              <p className="text-default-500 text-sm">
                {user.ethnicity ? ethnicities[user.ethnicity] : "-"}
              </p>
            </div> */}
            <div className="flex w-1/2 flex-col sm:w-1/4">
              <p>{t("country")}</p>
              <p className="text-default-500 text-sm">{user.country ? countries[user.country] : "-"}</p>
            </div>
          </div>
          <VerifyButton user={user} />
        </CardBody>
      </Card>
    </>
  );
};

export default PublicVerify;
