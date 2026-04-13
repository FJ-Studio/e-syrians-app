"use client";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import AuthLayout from "./layout";
type Props = {
  success: boolean;
};
const EmailVerification: FC<Props> = ({ success }) => {
  const t = useTranslations("emailVerification");
  const { status, update, data } = useSession();
  useEffect(() => {
    if (success) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }, // Confetti starts from the middle
      });
    }
  }, [success]);

  useEffect(() => {
    if (status === "authenticated") {
      update({
        ...data,
        user: {
          ...data.user,
          email_verified_at: new Date().toISOString(),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-gray-500">{success ? t("success") : t("error")}</p>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;
