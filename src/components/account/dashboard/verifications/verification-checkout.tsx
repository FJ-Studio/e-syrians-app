"use client";

import { requestVerification } from "@/hooks/use-identity-verification";
import { Link } from "@/i18n/routing";
import type { VerificationSummary, verificationCopy } from "@/lib/identity-verification";
import { Button } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";

const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

export default function VerificationCheckout({
  summary,
  copy,
  userId,
  onPaid,
}: {
  summary: VerificationSummary;
  copy: ReturnType<typeof verificationCopy>;
  userId: string;
  onPaid: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("terms.identityVerification");
  const params = useSearchParams();
  const order = params.get("order") ?? "";
  const returnStatus = params.get("checkout");
  const returning = uuid.test(order) && (returnStatus === "success" || returnStatus === "cancelled");
  const notified = useRef<string | null>(null);
  const checkout = useRef<string | null>(null);
  const samples = useRef(0);
  const starting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data, error, mutate } = useSWR<{ status: string }>(
    returning ? ["identity-checkout", userId, order] : null,
    () => requestVerification(`/checkout/${order}`),
    {
      shouldRetryOnError: false,
      refreshInterval: (result) =>
        returnStatus === "success" && result?.status === "pending" && samples.current < 12 ? 4_000 : 0,
      onSuccess(result) {
        samples.current += 1;
        if (result.status === "paid" && notified.current !== order) {
          notified.current = order;
          onPaid();
        }
      },
    },
  );
  const awaiting = returning && returnStatus === "success" && !error && (!data || data.status === "pending");
  const cancelled = returning && returnStatus === "cancelled" && !error && data?.status === "pending";
  const closed = returning && (error || (data && !["pending", "paid"].includes(data.status)));
  const canBuy = summary.can_purchase && summary.price_minor != null && summary.currency;
  const price =
    canBuy &&
    new Intl.NumberFormat(locale, { style: "currency", currency: summary.currency }).format(summary.price_minor! / 100);

  async function buy() {
    if (starting.current) return;
    starting.current = true;
    setBusy(true);
    setFailed(false);
    try {
      checkout.current ??= cancelled ? order : crypto.randomUUID();
      const result = await requestVerification<{ url: string }>("/checkout", {
        order: checkout.current,
        locale: locale === "ar" ? "ar" : "en",
      });
      const url = new URL(result.url);
      if (url.origin !== "https://checkout.stripe.com" || url.username || url.password) throw new Error();
      window.location.assign(url.href);
    } catch {
      setFailed(true);
      setBusy(false);
      starting.current = false;
    }
  }

  if (!returning && !canBuy) return null;

  return (
    <section className="border-default-200 grid gap-3 rounded-xl border p-4 sm:p-5">
      {awaiting && (
        <div className="flex flex-wrap items-center gap-2">
          <p role="status">{copy.checkoutPending}</p>
          <Button size="sm" variant="light" onPress={() => void mutate().catch(() => undefined)}>
            {copy.checkoutCheck}
          </Button>
        </div>
      )}
      {data?.status === "paid" && (
        <p role="status" className="text-success-700">
          {copy.checkoutPaid}
        </p>
      )}
      {cancelled && <p role="status">{copy.checkoutCancelled}</p>}
      {closed && <p role="alert">{copy.checkoutClosed}</p>}
      {failed && (
        <p role="alert" className="text-danger">
          {copy.failed}
        </p>
      )}
      {!awaiting && price && (
        <>
          <p className="text-default-600 text-sm">{copy.buyDetails}</p>
          <Link
            href="/terms#identity-verification-purchases"
            className="text-primary w-fit text-sm underline underline-offset-4"
          >
            {t("purchaseLink")}
          </Link>
          <Button color="primary" variant="bordered" className="w-fit" isLoading={busy} onPress={() => void buy()}>
            {copy.buy(price)}
          </Button>
        </>
      )}
    </section>
  );
}
