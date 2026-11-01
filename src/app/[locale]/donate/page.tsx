import Donate from "@/components/account/dashboard/donate/donate";
import PageLayout from "@/components/pages/layout";
import { getDonationSettings } from "@/lib/api/donations";

export default async function DonatePage() {
  const settings = await getDonationSettings();

  return (
    <PageLayout>
      <Donate cryptoWallets={settings.crypto_enabled ? settings.crypto_wallets : []} />
    </PageLayout>
  );
}
