"use client";

import { useAppleSignIn } from "@/hooks/use-apple-signin";
import { Button } from "@heroui/react";
import appleIcon from "@iconify-icons/simple-icons/apple";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useState } from "react";

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "";

type AppleSignInButtonProps = {
  redirectTo?: string;
};

/**
 * Renders the "Continue with Apple" button on the sign-in form. Uses Apple's
 * JS SDK (loaded on demand by useAppleSignIn) to get a user identity token,
 * exchanges it with our backend via /api/auth/social-login, and then bootstraps
 * a NextAuth session through the Credentials provider's `auth_token` path.
 */
const AppleSignInButton: FC<AppleSignInButtonProps> = ({ redirectTo = "/account" }) => {
  const t = useTranslations();
  const { signInWithApple, loading: sdkLoading } = useAppleSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = useCallback(async () => {
    if (!APPLE_CLIENT_ID) {
      setError(t("common.appleSignInNotConfigured"));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { identityToken, name } = await signInWithApple({
        clientId: APPLE_CLIENT_ID,
        redirectURI: window.location.origin,
      });

      // Exchange the Apple identity token for our own session token.
      // `name` is included only on first sign-in (Apple's one-shot quirk),
      // so the backend can store a real name instead of an email-derived one.
      const res = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "apple",
          token: identityToken,
          ...(name ? { name } : {}),
        }),
      });
      const data = await res.json();

      if (!data?.success || !data?.data?.token) {
        setError(data?.message || t("common.somethingWentWrong"));
        return;
      }

      // Hand the backend token to NextAuth so it can build a session.
      const result = await signIn("credentials", {
        auth_token: data.data.token,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        // Hard navigation so the NextAuth session cookie is picked up.
        window.location.href = redirectTo;
      }
    } catch (err) {
      // User dismissed the Apple popup — no error to show.
      if (
        err instanceof Error &&
        (err.message.includes("popup_closed_by_user") ||
          err.message.includes("popup") ||
          err.message.includes("cancel") ||
          err.message.includes("closed"))
      ) {
        return;
      }
      setError(t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [signInWithApple, redirectTo, t]);

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="bordered"
        className="w-full"
        isLoading={loading || sdkLoading}
        onPress={handleAppleSignIn}
        startContent={<Icon icon={appleIcon} width={24} height={24} />}
      >
        {t("common.continueWithApple")}
      </Button>
      {error && <p className="text-danger-500 mt-1 text-center text-xs">{error}</p>}
    </div>
  );
};

export default AppleSignInButton;
