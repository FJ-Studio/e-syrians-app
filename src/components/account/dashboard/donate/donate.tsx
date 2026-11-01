"use client";

import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from "@/lib/env";
import { CryptoDonationWallet } from "@/lib/types/donations";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import checkCircleIcon from "@iconify-icons/heroicons/check-circle";
import creditCardIcon from "@iconify-icons/heroicons/credit-card";
import heartIcon from "@iconify-icons/heroicons/heart";
import xCircleIcon from "@iconify-icons/heroicons/x-circle";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import CryptoDonations from "./crypto-donations";

// ---------------------------------------------------------------------------
// Preset amounts (in USD)
// ---------------------------------------------------------------------------

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Donate: FC<{ cryptoWallets: CryptoDonationWallet[] }> = ({ cryptoWallets }) => {
  const t = useTranslations("donate");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const status = searchParams.get("status");

  // Clean the URL after reading the status so refreshing doesn't re-show the banner
  useEffect(() => {
    if (status) {
      router.replace("/donate", { scroll: false });
    }
  }, [status, router]);

  const stripeEnabled = !!NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const effectiveAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const handleStripeDonate = async () => {
    if (!effectiveAmount || effectiveAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(effectiveAmount * 100) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const code = data.errorCode;
        toast.error(t.has(`stripe.errors.${code}`) ? t(`stripe.errors.${code}`) : t("stripe.errors.default"));
      }
    } catch {
      toast.error(t("stripe.errors.default"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
          <Icon icon={heartIcon} className="size-6" />
        </div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-default-500 mt-1 text-sm">{t("subtitle")}</p>
      </div>

      {/* Payment status banner */}
      {status === "success" && (
        <Card className="border-success-200 bg-success-50 border">
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <Icon icon={checkCircleIcon} className="text-success size-6 shrink-0" />
            <div>
              <p className="text-success-800 font-semibold">{t("status.success.title")}</p>
              <p className="text-success-700 text-sm">{t("status.success.description")}</p>
            </div>
          </CardBody>
        </Card>
      )}
      {status === "cancelled" && (
        <Card className="border-warning-200 bg-warning-50 border">
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <Icon icon={xCircleIcon} className="text-warning size-6 shrink-0" />
            <div>
              <p className="text-warning-800 font-semibold">{t("status.cancelled.title")}</p>
              <p className="text-warning-700 text-sm">{t("status.cancelled.description")}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stripe card payment */}
      {stripeEnabled && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Icon icon={creditCardIcon} className="text-primary size-5" />
            <h2 className="text-lg font-semibold">{t("stripe.title")}</h2>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col items-start space-y-4">
            <p className="text-default-500 text-sm">{t("stripe.description")}</p>

            {/* Preset amounts */}
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant={selectedAmount === amount ? "solid" : "bordered"}
                  color={selectedAmount === amount ? "primary" : "default"}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  ${amount}
                </Button>
              ))}
              <Button
                size="sm"
                variant={selectedAmount === null ? "solid" : "bordered"}
                color={selectedAmount === null ? "primary" : "default"}
                onPress={() => setSelectedAmount(null)}
              >
                {t("stripe.custom")}
              </Button>
            </div>

            {/* Custom amount input */}
            {selectedAmount === null && (
              <div className="flex items-center gap-2">
                <span className="text-default-500 text-lg font-semibold">$</span>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  step="1"
                  aria-label={t("stripe.custom")}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t("stripe.amountPlaceholder")}
                  className="border-default-300 focus:border-primary w-32 rounded-lg border px-3 py-2 text-sm outline-none"
                />
              </div>
            )}

            <Button
              color="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              isDisabled={!effectiveAmount || effectiveAmount < 1}
              onPress={handleStripeDonate}
              startContent={!loading && <Icon icon={creditCardIcon} className="size-5" />}
            >
              {effectiveAmount ? t("stripe.donateAmount", { amount: `$${effectiveAmount}` }) : t("stripe.donate")}
            </Button>
          </CardBody>
        </Card>
      )}

      <CryptoDonations wallets={cryptoWallets} />
    </div>
  );
};

export default Donate;
