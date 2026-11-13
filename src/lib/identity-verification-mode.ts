export const liveVerificationEnabled = () => process.env.NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED === "true";
export const verificationEnabled = () =>
  liveVerificationEnabled() || process.env.NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED === "true";
export const verificationPage = () =>
  liveVerificationEnabled() ? "/account/identity-verification" : "/account/identity-sandbox";
