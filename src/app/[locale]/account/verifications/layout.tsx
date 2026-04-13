import VerificationsRouteTabs from "@/components/account/dashboard/verifications/verifications-route-tabs";

export default function VerificationsLayout({ children }: { children: React.ReactNode }) {
  return <VerificationsRouteTabs>{children}</VerificationsRouteTabs>;
}
