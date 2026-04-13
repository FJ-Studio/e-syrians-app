"use client";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useState } from "react";
import AccountAvatar from "./avatar";
import AccountCensus from "./census";
import AccountAddress from "./country";
import AccountSocialLinks from "./social-links";
import UpdateBasicProfileData from "./update-basic";

const AccountProfile: FC = () => {
  const t = useTranslations("account.settings");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState();

  const getProfile = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <>
      {!loading && !profile && (
        <Button onPress={() => getProfile()} color="danger" className="mb-4">
          {t("error.tryAgain")}
        </Button>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <AccountSocialLinks user={profile} />
          <UpdateBasicProfileData user={profile} />
        </div>
        <div className="space-y-4">
          <AccountAvatar user={profile} onUpdated={getProfile} />
          <AccountAddress user={profile} />
          <AccountCensus user={profile} />
        </div>
      </div>
    </>
  );
};

export default AccountProfile;
