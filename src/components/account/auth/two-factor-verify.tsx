"use client";

import { Button, Input } from "@heroui/react";
import clockCircleIcon from "@iconify-icons/solar/clock-circle-bold";
import shieldKeyholeIcon from "@iconify-icons/solar/shield-keyhole-bold";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TwoFactorVerifyProps {
  challengeToken: string;
  expiresAt: string;
  onBack: () => void;
}

export default function TwoFactorVerify({ challengeToken, expiresAt, onBack }: TwoFactorVerifyProps) {
  const t = useTranslations("auth.twoFactor");
  const [code, setCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = new Date(expiresAt) < new Date();

  const handleVerify = async () => {
    if (!code) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        challenge_token: challengeToken,
        twofa_code: code,
        is_recovery_code: isRecoveryCode ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("INVALID_2FA_CODE")) {
          setError(t("invalidCode"));
        } else {
          setError(t("invalidCode"));
        }
      } else if (result?.ok) {
        window.location.href = "/account";
      }
    } catch {
      setError(t("invalidCode"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isExpired) {
    return (
      <div className="flex w-full flex-col items-center gap-4 p-4">
        <Icon icon={clockCircleIcon} width={48} height={48} className="text-danger" />
        <p className="text-default-600 text-center">{t("challengeExpired")}</p>
        <Button color="primary" variant="flat" onPress={onBack}>
          {t("backToLogin")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 p-4">
      <Icon icon={shieldKeyholeIcon} width={48} height={48} className="text-primary" />
      <p className="w-full text-center font-medium">{t("title")}</p>
      <p className="text-default-500 text-center text-sm">{t("description")}</p>

      <div className="flex w-full flex-col gap-3">
        <Input
          value={code}
          onValueChange={(val) => {
            setCode(val);
            setError(null);
          }}
          label={t("code")}
          maxLength={isRecoveryCode ? 14 : 6}
          isInvalid={!!error}
          errorMessage={error}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleVerify();
            }
          }}
        />

        <Button color="primary" onPress={handleVerify} isLoading={isSubmitting} isDisabled={!code}>
          {t("verify")}
        </Button>

        <Button
          variant="light"
          size="sm"
          onPress={() => {
            setIsRecoveryCode(!isRecoveryCode);
            setCode("");
            setError(null);
          }}
        >
          {isRecoveryCode ? t("useAuthenticatorCode") : t("useRecoveryCode")}
        </Button>

        <Button variant="light" size="sm" onPress={onBack}>
          {t("backToLogin")}
        </Button>
      </div>
    </div>
  );
}
