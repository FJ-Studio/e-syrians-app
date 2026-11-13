import IdentitySandbox from "@/components/account/dashboard/verifications/identity-sandbox";
import { liveVerificationEnabled } from "@/lib/identity-verification-mode";
import { notFound } from "next/navigation";

export default function IdentitySandboxPage() {
  if (liveVerificationEnabled() || process.env.NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED !== "true") notFound();
  return <IdentitySandbox />;
}
