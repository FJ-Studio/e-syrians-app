"use client";

import { useEsyrian } from "@/components/shared/contexts/es";
import { Button, Checkbox, Divider, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TwoFactorVerify from "./two-factor-verify";

export default function LoginForm() {
  const { openCensusForm } = useEsyrian();

  const [isVisible, setIsVisible] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<{
    challengeToken: string;
    expiresAt: string;
  } | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const t = useTranslations();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<{
    email: string;
    password: string;
  }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      // Check if this is a 2FA challenge
      const errorUrl = result.error;
      // NextAuth encodes the error — check for our 2FA marker
      if (errorUrl.includes("2FA_REQUIRED")) {
        // Extract challenge data from the error message
        // The error comes through as a URL-encoded string
        const match = errorUrl.match(/2FA_REQUIRED:([^:]+):(.+)/);
        if (match) {
          setTwoFactorChallenge({
            challengeToken: match[1],
            expiresAt: match[2],
          });
          return;
        }
      }
      // Other login errors — let NextAuth handle redirect
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        redirectTo: "/account",
      });
    } else if (result?.ok) {
      // Successful login without 2FA — hard-navigate so NextAuth session cookies refresh.
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = "/account";
    }
  };

  // Show 2FA verification form if challenge is active
  if (twoFactorChallenge) {
    return (
      <TwoFactorVerify
        challengeToken={twoFactorChallenge.challengeToken}
        expiresAt={twoFactorChallenge.expiresAt}
        onBack={() => setTwoFactorChallenge(null)}
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 p-4">
      <p className="w-full font-medium">{t("loginToYourAccount")}</p>
      <div className="flex w-full flex-col gap-2">
        <Button
          startContent={<Icon icon="flat-color-icons:google" width={24} />}
          variant="bordered"
          className="w-full"
          onPress={() =>
            signIn("google", {
              redirect: true,
              redirectTo: "/account",
            })
          }
        >
          {t("common.continueWithGoogle")}
        </Button>
      </div>

      <div className="flex w-full items-center gap-4 py-2">
        <Divider className="w-full flex-1" />
        <p className="text-tiny text-default-500 shrink-0">{t("common.or")}</p>
        <Divider className="w-full flex-1" />
      </div>
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} isRequired label={t("auth.login.identifier")} />}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Icon className="text-default-400 pointer-events-none text-2xl" icon="solar:eye-closed-linear" />
                  ) : (
                    <Icon className="text-default-400 pointer-events-none text-2xl" icon="solar:eye-bold" />
                  )}
                </button>
              }
              label={t("common.password")}
              name="password"
              errorMessage={t("common.typePassword")}
              type={isVisible ? "text" : "password"}
            />
          )}
        />
        <div className="flex items-center justify-between">
          <Checkbox className="py-4" size="sm">
            {t("common.rememberMe")}
          </Checkbox>
          <Link href="/auth/forgot-password" title={t("auth.login.forgotPassword")} className="text-sm">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
        <Button color="primary" type="submit" isLoading={isSubmitting}>
          {t("common.login")}
        </Button>
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="light" color="primary" onPress={() => openCensusForm(true)}>
            {t("orRegister")}
          </Button>
        </div>
      </form>
    </div>
  );
}
