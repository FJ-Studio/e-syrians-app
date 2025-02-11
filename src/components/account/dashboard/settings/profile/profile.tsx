"use client";
import { Button, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";

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
        if (data.success) setProfile(data);
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
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center flex-col">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          {!profile && (
            <Button onPress={() => getProfile()} color="danger">
              {t("error.tryAgain")}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default AccountProfile;
