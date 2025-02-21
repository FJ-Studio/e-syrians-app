"use client";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import AuthLayout from "./layout";
type Props = {
  success: boolean;
};
const EmailVerification: FC<Props> = ({ success }) => {
  const t = useTranslations("emailVerification");
  useEffect(() => {
    if (success) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }, // Confetti starts from the middle
      });
    }
  }, [success]);
  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-gray-500">{success ? t("success") : t("error")}</p>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;
