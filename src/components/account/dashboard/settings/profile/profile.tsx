"use client";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import UpdateBasicProfileData from "./update-basic";

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
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error(error);
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
        <Button onPress={() => getProfile()} color="danger">
          {t("error.tryAgain")}
        </Button>
      )}

      <div className=" grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <UpdateBasicProfileData user={profile} />
        </div>
        <div>Another section</div>
      </div>
    </>
  );
};

export default AccountProfile;
