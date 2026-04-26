import { ESUser } from "@/lib/types/account";
import { useTranslations } from "next-intl";
import { FC } from "react";
import ShortUserSummary from "./cards/short-summary";

type Props = {
  users: Array<ESUser>;
};

const FirstRegistrants: FC<Props> = ({ users }) => {
  const t = useTranslations("census.first");

  return (
    <>
      <h1 className="text-default-700 mb-2 text-3xl font-bold">{t("title")}</h1>
      <p>
        {t("description", {
          count: users.length,
        })}
      </p>
      <div className="xl:grid-col-6 my-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {users.map((user) => (
          <ShortUserSummary user={user} key={user.uuid} />
        ))}
      </div>
    </>
  );
};

export default FirstRegistrants;
