"use client";
import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
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
    <Card className="space-y-4 ">
      <CardHeader>Edit my profile</CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex items-center flex-col">
            <Spinner color="primary" />
          </div>
        ) : (
          <>
            {!profile ? (
              <Button onPress={() => getProfile()} color="danger">
                {t("error.tryAgain")}
              </Button>
            ) : (
              <UpdateBasicProfileData user={profile} />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default AccountProfile;
