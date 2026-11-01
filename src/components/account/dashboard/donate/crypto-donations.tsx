"use client";

import { ibm } from "@/lib/fonts/fonts";
import { CryptoDonationWallet } from "@/lib/types/donations";
import { Card, CardBody, CardHeader, Chip, Divider, Snippet } from "@heroui/react";
import currencyDollarIcon from "@iconify-icons/heroicons/currency-dollar";
import bitcoinIcon from "@iconify-icons/simple-icons/bitcoin";
import ethereumIcon from "@iconify-icons/simple-icons/ethereum";
import tetherIcon from "@iconify-icons/simple-icons/tether";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";

const CURRENCY_STYLES = {
  BTC: { icon: bitcoinIcon, color: "warning", className: "text-warning" },
  ETH: { icon: ethereumIcon, color: "secondary", className: "text-secondary" },
  USDT: { icon: tetherIcon, color: "success", className: "text-success" },
} as const;

export default function CryptoDonations({ wallets }: { wallets: CryptoDonationWallet[] }) {
  const t = useTranslations("donate.crypto");
  if (wallets.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Icon icon={bitcoinIcon} className="text-warning size-5" />
        <h2 className="text-lg font-semibold">{t("title")}</h2>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col items-start space-y-4">
        <p className="text-default-500 text-sm">{t("description")}</p>

        {wallets.map((wallet, index) => {
          const style = CURRENCY_STYLES[wallet.currency as keyof typeof CURRENCY_STYLES] ?? {
            icon: currencyDollarIcon,
            color: "default" as const,
            className: "text-default-500",
          };

          return (
            <div key={`${wallet.currency}-${wallet.network}-${index}`} className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <Icon icon={style.icon} className={`${style.className} size-4`} />
                <span className="text-sm font-semibold">
                  {wallet.name} (<bdi>{wallet.currency}</bdi>)
                </span>
                {wallet.network && (
                  <Chip size="sm" variant="flat" color={style.color}>
                    <bdi>{wallet.network}</bdi>
                  </Chip>
                )}
              </div>
              <Snippet
                hideSymbol
                variant="bordered"
                dir="ltr"
                classNames={{ base: "w-full", pre: `${ibm.className} text-xs break-all whitespace-pre-wrap` }}
                codeString={wallet.address}
              >
                {wallet.address}
              </Snippet>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
