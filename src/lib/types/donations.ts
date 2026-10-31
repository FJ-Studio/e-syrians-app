export interface CryptoDonationWallet {
  name: string;
  currency: string;
  network: string | null;
  address: string;
}

export interface DonationSettings {
  crypto_enabled: boolean;
  crypto_wallets: CryptoDonationWallet[];
}
