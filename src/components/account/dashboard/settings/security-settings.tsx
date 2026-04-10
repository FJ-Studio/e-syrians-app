import { useTranslations } from "next-intl";
import { FC } from "react";
import UpdatePassword from "./security/update-password";
import UpdateEmailAddress from "./security/update-email";
import TwoFactorAuth from "./security/two-factor-auth";

const AccountSecurity: FC = () => {
  const t = useTranslations("account.dashboard.security");

  return (
    <>
      <h2 className="text-xl font-medium text-default-700 text-start">
        {t("title")}
      </h2>
      <p className="text-default-500 text-start">{t("description")}</p>
      <div className="mt-4 gap-4 grid grid-cols-1 lg:grid-cols-2">
        <div>
          <UpdatePassword />
        </div>
        <div>
          <UpdateEmailAddress />
        </div>
        <div className="lg:col-span-2">
          <TwoFactorAuth />
        </div>
      </div>
    </>
  );
};

export default AccountSecurity;
