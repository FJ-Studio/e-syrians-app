import IdentitySandbox from "@/components/account/dashboard/verifications/identity-sandbox";
import { liveVerificationEnabled } from "@/lib/identity-verification-mode";
import { notFound } from "next/navigation";

export default function IdentityVerificationPage() {
  if (!liveVerificationEnabled()) notFound();
  return <IdentitySandbox />;
}
