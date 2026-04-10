"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useEsyrian } from "@/components/shared/contexts/es";
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
        const match = errorUrl.match(
          /2FA_REQUIRED:([^:]+):(.+)/,
        );
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
      // Successful login without 2FA
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
      <p className="font-medium w-full">{t("loginToYourAccount")}</p>
      <div className="flex flex-col gap-2 w-full">
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

      <div className="flex items-center gap-4 py-2 w-full ">
        <Divider className="flex-1 w-full" />
        <p className="shrink-0 text-tiny text-default-500">{t("common.or")}</p>
        <Divider className="flex-1 w-full" />
      </div>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} isRequired label={t("auth.login.identifier")} />
          )}
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
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-bold"
                    />
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
          <Link
            href="/auth/forgot-password"
            title={t("auth.login.forgotPassword")}
            className="text-sm"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
        <Button color="primary" type="submit" isLoading={isSubmitting}>
          {t("common.login")}
        </Button>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="light"
            color="primary"
            onPress={() => openCensusForm(true)}
          >
            {t("orRegister")}
          </Button>
        </div>
      </form>
    </div>
  );
}
