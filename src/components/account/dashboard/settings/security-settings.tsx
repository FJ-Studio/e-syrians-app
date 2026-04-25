import { FC } from "react";
import TwoFactorAuth from "./security/two-factor-auth";
import UpdateEmailAddress from "./security/update-email";
import UpdatePassword from "./security/update-password";

const AccountSecurity: FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <UpdatePassword />
      <UpdateEmailAddress />
      <TwoFactorAuth />
    </div>
  );
};

export default AccountSecurity;
