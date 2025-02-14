"use client";
import { ESUser } from "@/lib/types/account";
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { toast } from "sonner";

type Props = {
  user: ESUser;
};

const VerifyButton: FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const t = useTranslations("publicVerify");

  const verify = async () => {
    if (session.status !== "authenticated") {
      toast.error(t("loginToVerify"));
      return;
    }
    if (user.uuid === session.data.user.uuid) {
      toast.error(t("cannotVerifyOwnProfile"));
      return;
    }
    setLoading(true);
  };

  return (
    <Button color="primary" fullWidth onPress={verify} isLoading={loading}>
      {t("verify")}
    </Button>
  );
};

export default VerifyButton;
