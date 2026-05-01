"use client";
import { useCallback, useState } from "react";

const APPLE_JS_SDK_URL = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

let sdkPromise: Promise<void> | null = null;

function loadAppleSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Apple Sign-In can only run in the browser"));
      return;
    }

    if (window.AppleID) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = APPLE_JS_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load Apple Sign In SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

type AppleSignInOptions = {
  clientId: string;
  redirectURI: string;
  usePopup?: boolean;
};

type AppleSignInResult = {
  identityToken: string;
  /**
   * Apple only returns the user's name on the very first sign-in (and only
   * if the popup is invoked with name in scope). On every subsequent sign-in
   * `name` is undefined. Capture it on first auth and pass it to the backend
   * so the user record gets a real name instead of the email-derived fallback.
   */
  name?: string;
};

/**
 * Loads Apple's JS SDK on demand and runs the popup-based sign-in flow.
 * Returns the identity token plus the user's name on first sign-in. The
 * caller exchanges these with our backend (POST /api/auth/social-login →
 * /users/login/social) for an app session.
 */
export function useAppleSignIn() {
  const [loading, setLoading] = useState(false);

  const signInWithApple = useCallback(async (options: AppleSignInOptions): Promise<AppleSignInResult> => {
    setLoading(true);
    try {
      await loadAppleSDK();

      window.AppleID.auth.init({
        clientId: options.clientId,
        redirectURI: options.redirectURI,
        usePopup: options.usePopup ?? true,
        // Request name + email so Apple sends the user object on first sign-in.
        scope: "name email",
      });

      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization?.id_token;

      if (!idToken) {
        throw new Error("Apple Sign-In succeeded but no identity token was returned");
      }

      const firstName = response.user?.name?.firstName?.trim() ?? "";
      const lastName = response.user?.name?.lastName?.trim() ?? "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");

      return {
        identityToken: idToken,
        name: fullName || undefined,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { signInWithApple, loading };
}
