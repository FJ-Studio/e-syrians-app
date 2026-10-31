import Donate from "@/components/account/dashboard/donate/donate";
import { getDonationSettings } from "@/lib/api/donations";

export default async function AccountDonatePage() {
  const settings = await getDonationSettings();

  return <Donate cryptoWallets={settings.crypto_enabled ? settings.crypto_wallets : []} />;
}
