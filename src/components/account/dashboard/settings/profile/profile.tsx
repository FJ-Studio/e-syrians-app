"use client";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import UpdateBasicProfileData from "./update-basic";
import AccountSocialLinks from "./social-links";
import AccountAvatar from "./avatar";
import AccountAddress from "./country";
import AccountCensus from "./census";

const AccountProfile: FC = () => {
  const t = useTranslations("account.settings");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState();

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/profile/general");
      if (response.ok) {
        const data = await response.json();
        if (data?.success) setProfile(data?.data);
      }
    } catch {
      // Error handled by loading/profile state — retry button shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <>
      {!loading && !profile && (
        <Button onPress={() => getProfile()} color="danger" className="mb-4">
          {t("error.tryAgain")}
        </Button>
      )}

      <div className=" grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <AccountSocialLinks user={profile} />
          <UpdateBasicProfileData user={profile} />
        </div>
        <div className="space-y-4">
          <AccountAvatar user={profile} />
          <AccountAddress user={profile} />
          <AccountCensus user={profile} />
        </div>
      </div>
    </>
  );
};

export default AccountProfile;
