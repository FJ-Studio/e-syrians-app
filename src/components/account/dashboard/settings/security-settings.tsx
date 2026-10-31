import { FC } from "react";
import DeleteAccount from "./security/delete-account";
import TwoFactorAuth from "./security/two-factor-auth";
import UpdateEmailAddress from "./security/update-email";
import UpdatePassword from "./security/update-password";

const AccountSecurity: FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <UpdatePassword />
      <UpdateEmailAddress />
      <TwoFactorAuth />
      {/* Destructive section — sits at the bottom of the security page.
       *  Flips to a red "Deletion scheduled" banner once a request is
       *  in flight; both request + cancel re-verify the password. */}
      <DeleteAccount />
    </div>
  );
};

export default AccountSecurity;
