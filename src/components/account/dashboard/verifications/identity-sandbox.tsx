"use client";

import {
  requestVerification,
  useVerificationCreditHistory,
  useVerificationSummary,
  VerificationRequestError,
} from "@/hooks/use-identity-verification";
import { Link } from "@/i18n/routing";
import {
  giftUnavailableReason,
  verificationCard,
  verificationCopy,
  verificationError,
  verificationState,
  type GiftCode,
  type VerificationPayload,
} from "@/lib/identity-verification";
import { liveVerificationEnabled } from "@/lib/identity-verification-mode";
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@heroui/react";
import arrowSmallLeft from "@iconify-icons/heroicons/arrow-small-left";
import checkCircle from "@iconify-icons/heroicons/check-circle";
import clock from "@iconify-icons/heroicons/clock";
import exclamationCircle from "@iconify-icons/heroicons/exclamation-circle";
import giftIcon from "@iconify-icons/heroicons/gift";
import lockClosed from "@iconify-icons/heroicons/lock-closed";
import ticket from "@iconify-icons/heroicons/ticket";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import CreditHistory from "./credit-history";
import VerificationCheckout from "./verification-checkout";

const reviewInterval = 15_000;

export default function IdentitySandbox() {
  const { data: session } = useSession();
  return session?.user.uuid ? <VerificationScreen key={session.user.uuid} userId={session.user.uuid} /> : null;
}

const tones = {
  brand: { className: "bg-primary/10 text-primary", icon: ticket },
  neutral: { className: "bg-default-100 text-default-700", icon: ticket },
  progress: { className: "bg-primary/10 text-primary", icon: clock },
  success: { className: "bg-success/15 text-success-700", icon: checkCircle },
  warning: { className: "bg-warning/15 text-warning-700", icon: exclamationCircle },
};

function VerificationScreen({ userId }: { userId: string }) {
  const locale = useLocale();
  const t = useTranslations("privacyPolicy.identityVerification");
  const live = liveVerificationEnabled();
  const copy = verificationCopy(locale, live);
  const { data, error: loadError, isLoading, mutate } = useVerificationSummary(userId);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<{ status: number; action: string }>();
  const [dialog, setDialog] = useState<"receive" | "gift">();
  const [code, setCode] = useState<GiftCode>();
  const [giftInput, setGiftInput] = useState("");
  const [notice, setNotice] = useState<"sent" | "copied">();
  const [lastChecked, setLastChecked] = useState<Date>();
  const [historyPage, setHistoryPage] = useState(1);
  const [consent, setConsent] = useState(false);
  const [blockedPopup, setBlockedPopup] = useState<{ credit: string; url: string }>();
  const returning = useRef<string | null>(null);
  const checked = useRef<string | null>(null);
  const inFlight = useRef(false);
  const active = useRef(false);
  const pendingTab = useRef<Window | null>(null);
  const summary = [401, 403, 404].includes(loadError?.status ?? 0) ? undefined : data;
  const {
    data: history,
    error: historyError,
    isLoading: historyLoading,
    mutate: reloadHistory,
  } = useVerificationCreditHistory(userId, historyPage, !!summary);
  const state = summary && verificationState(summary);
  const card = summary && verificationCard(summary, copy);
  const tone = card && tones[card.tone];
  const time = (value: string | Date) =>
    new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(new Date(value));
  const validCode = code;

  const run = useCallback(
    async (action: string, path: string, body = {}, quiet = false) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (!quiet) {
        setBusy(action);
        setError(undefined);
        setNotice(undefined);
      }
      try {
        const payload = await requestVerification<VerificationPayload>(path, body);
        if ("credits" in payload) await mutate(payload, false);
        if (action === "claim" || action === "gift") {
          setHistoryPage(1);
          void reloadHistory().catch(() => undefined);
        }
        if ("code" in payload) setCode(payload);
        if (action === "refresh") setLastChecked(new Date());
        if (action === "gift") {
          setDialog(undefined);
          setGiftInput("");
          setNotice("sent");
        }
        return payload;
      } catch (err) {
        const status = err instanceof VerificationRequestError ? err.status : 0;
        if (!quiet) setError({ status, action });
        if ([401, 403, 404, 409].includes(status)) void mutate().catch(() => undefined);
      } finally {
        inFlight.current = false;
        if (!quiet) setBusy("");
      }
    },
    [
      mutate,
      reloadHistory,
      setBusy,
      setCode,
      setDialog,
      setError,
      setGiftInput,
      setHistoryPage,
      setLastChecked,
      setNotice,
    ],
  );

  const refresh = useCallback(
    (credit: string, quiet = false) => run("refresh", `/${credit}/refresh`, {}, quiet),
    [run],
  );
  const current = state?.current;
  const currentId = current?.uuid;
  const currentStatus = current?.status;

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      pendingTab.current?.close();
      pendingTab.current = null;
    };
  }, []);

  useEffect(() => {
    if (!summary?.provider_ready || !currentId || busy) return;
    if (currentStatus === "pending" && checked.current !== currentId) {
      checked.current = currentId;
      void refresh(currentId, true);
    }
    if (currentStatus !== "in_review") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(currentId, true);
    }, reviewInterval);
    return () => window.clearInterval(timer);
  }, [summary?.provider_ready, currentId, currentStatus, refresh, busy]);

  useEffect(() => {
    const onReturn = () => {
      if (document.visibilityState !== "visible" || !returning.current || inFlight.current) return;
      const credit = returning.current;
      returning.current = null;
      void refresh(credit);
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [refresh]);

  useEffect(() => {
    if (!code) return;
    const timer = window.setTimeout(() => setCode(undefined), Math.max(0, Date.parse(code.expires_at) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    if (notice !== "copied") return;
    const timer = window.setTimeout(() => setNotice(undefined), 2_000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function start(credit: string) {
    if (inFlight.current || (live && !consent)) return;
    setBlockedPopup(undefined);
    // Open from the user gesture; otherwise browsers can block the tab
    // after the network round-trip. Never give Didit a window opener.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    pendingTab.current = tab;
    const payload = await run("start", `/${credit}/start`, {
      locale: locale === "ar" ? "ar" : "en",
      ...(live && { consent }),
    });
    pendingTab.current = null;
    if (!active.current) return;
    if (!payload || !("url" in payload)) {
      tab?.close();
      void mutate().catch(() => undefined);
      return;
    }
    checked.current = credit;
    if (tab && !tab.closed) {
      returning.current = credit;
      try {
        tab.location.replace(payload.url);
      } catch {
        returning.current = null;
        setBlockedPopup({ credit, url: payload.url });
      }
    } else {
      setBlockedPopup({ credit, url: payload.url });
    }
    await mutate().catch(() => undefined);
  }

  function closeDialog() {
    setDialog(undefined);
    setGiftInput("");
    setNotice(undefined);
    setError(undefined);
  }

  const dialogAction = dialog === "gift" ? "gift" : "gift-code";
  const dialogError = error && dialog && error.action === dialogAction;
  const action = card?.action;
  const canOpenDidit = blockedPopup && current?.uuid === blockedPopup.credit && current.status === "pending";

  return (
    <section className="grid w-full gap-5">
      <header className="grid gap-2">
        <Link
          href="/account"
          className="text-primary mb-1 inline-flex min-h-9 w-fit items-center gap-2 text-sm font-medium hover:underline"
        >
          <Icon icon={arrowSmallLeft} className="size-5 rtl:rotate-180" aria-hidden />
          {copy.back}
        </Link>
        <h1 className="text-3xl font-semibold">{copy.title}</h1>
        <p className="text-default-600">{copy.intro}</p>
      </header>

      <aside className="bg-warning/15 text-warning-800 flex gap-3 rounded-xl px-4 py-3 text-sm">
        <Icon icon={lockClosed} className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">{copy.test}</p>
          <p>{copy.safety}</p>
          {live && (
            <Link href="/privacy-policy#identity-verification" className="underline">
              {t("privacyLink")}
            </Link>
          )}
        </div>
      </aside>

      {isLoading && (
        <div role="status" className="text-default-600 flex items-center gap-3 py-4">
          <Spinner size="sm" />
          {copy.loading}
        </div>
      )}
      {loadError && !summary && (
        <div className="grid justify-items-start gap-3">
          <p role="alert" className="text-danger">
            {verificationError(loadError.status, copy)}
          </p>
          {loadError.status !== 404 && (
            <Button variant="bordered" onPress={() => void mutate().catch(() => undefined)}>
              {copy.retry}
            </Button>
          )}
        </div>
      )}
      {error && !dialogError && (
        <p role="alert" className="text-danger text-sm">
          {verificationError(error.status, copy, error.action)}
        </p>
      )}
      {notice === "sent" && (
        <p role="status" className="text-success-700 text-sm">
          {copy.sent}
        </p>
      )}

      {summary && state && card && tone && (
        <>
          <section
            aria-labelledby="verification-state-title"
            className="border-default-200 bg-content1 grid gap-4 rounded-xl border p-5 sm:p-6"
          >
            <div aria-live="polite" className="grid gap-2">
              <p
                className={`${tone.className} flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium`}
              >
                <Icon icon={tone.icon} className="size-4" aria-hidden />
                {card.status}
              </p>
              <h2 id="verification-state-title" className="text-2xl font-semibold">
                {card.title}
              </h2>
              <p className="text-default-600">
                {card.body}
                {current?.status === "available" ? ` ${copy.openInTab}` : ""}
              </p>
              {state.balance > 0 && currentStatus !== "available" && (
                <p className="text-primary text-sm font-semibold tabular-nums">{copy.balance(state.balance)}</p>
              )}
            </div>
            {!summary.provider_ready && <p className="text-default-600 text-sm">{copy.providerUnavailable}</p>}
            {live && action?.kind === "start" && !canOpenDidit && (
              <Checkbox isSelected={consent} onValueChange={setConsent}>
                {copy.consent}
              </Checkbox>
            )}
            {canOpenDidit ? (
              <Button
                as="a"
                href={blockedPopup.url}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                className="w-fit"
                onPress={() => {
                  returning.current = blockedPopup.credit;
                }}
              >
                {copy.openDidit}
              </Button>
            ) : (
              action && (
                <Button
                  color="primary"
                  className="w-fit"
                  isLoading={busy === action.kind}
                  isDisabled={
                    !!busy ||
                    (action.kind !== "claim" && !summary.provider_ready) ||
                    (live && action.kind === "start" && !consent)
                  }
                  onPress={() =>
                    void (action.kind === "start"
                      ? start(action.credit)
                      : action.kind === "refresh"
                        ? refresh(action.credit)
                        : run("claim", "/claim"))
                  }
                >
                  {action.label}
                </Button>
              )
            )}
            {current?.status === "in_review" && lastChecked && (
              <p className="text-default-600 text-sm">{copy.lastChecked(time(lastChecked))}</p>
            )}
          </section>

          {live && (
            <Suspense fallback={null}>
              <VerificationCheckout
                userId={userId}
                summary={summary}
                copy={copy}
                onPaid={() => {
                  void mutate().catch(() => undefined);
                  setHistoryPage(1);
                  void reloadHistory().catch(() => undefined);
                }}
              />
            </Suspense>
          )}

          <section
            aria-labelledby="verification-gifts-title"
            className="border-default-200 divide-default-200 divide-y border-t pt-2"
          >
            <h2 id="verification-gifts-title" className="py-3 text-lg font-semibold">
              {copy.gifts}
            </h2>
            <GiftRow
              title={copy.receive}
              body={copy.receiveBody}
              disabled={!!busy}
              onPress={() => {
                setError(undefined);
                setNotice(undefined);
                setDialog("receive");
              }}
            />
            <GiftRow
              title={copy.gift}
              body={giftUnavailableReason(state, copy) ?? copy.giftBody}
              disabled={!!busy || !state.giftable}
              onPress={() => {
                setError(undefined);
                setNotice(undefined);
                setDialog("gift");
              }}
            />
          </section>
          <CreditHistory
            copy={copy}
            locale={locale}
            history={history}
            loading={historyLoading}
            failed={!!historyError}
            onPageChange={setHistoryPage}
            onRetry={() => void reloadHistory().catch(() => undefined)}
          />
        </>
      )}

      <Modal
        isOpen={!!dialog}
        onOpenChange={(open) => {
          if (!open && !busy) closeDialog();
        }}
        isDismissable={!busy}
        isKeyboardDismissDisabled={!!busy}
        hideCloseButton
      >
        <ModalContent>
          <ModalHeader>{dialog === "receive" ? copy.receive : copy.gift}</ModalHeader>
          <ModalBody>
            <p className="text-default-600">{dialog === "receive" ? copy.receiveDetails : copy.giftDetails}</p>
            {dialog === "receive" && validCode && (
              <div>
                <code dir="ltr" className="bg-default-100 block rounded-lg p-3 text-center break-all select-all">
                  {validCode.code}
                </code>
                <p className="text-default-600 mt-2 text-sm">{copy.expires(time(validCode.expires_at))}</p>
              </div>
            )}
            {dialog === "gift" && (
              <>
                <label className="grid gap-1 text-sm font-medium">
                  {copy.giftCode}
                  <input
                    dir="ltr"
                    className="border-default-300 focus-visible:outline-primary rounded-lg border bg-transparent p-3 text-base focus-visible:outline-2"
                    value={giftInput}
                    onChange={(event) => setGiftInput(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </label>
                {state && <p className="text-default-600 text-sm">{copy.balance(state.balance)}</p>}
              </>
            )}
            {dialogError && (
              <p role="alert" className="text-danger text-sm">
                {verificationError(error.status, copy, error.action)}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" isDisabled={!!busy} onPress={closeDialog}>
              {copy.close}
            </Button>
            {dialog === "receive" && validCode && (
              <Button
                variant="bordered"
                isLoading={busy === "gift-code"}
                onPress={() => void run("gift-code", "/gift-code")}
              >
                {copy.newCode}
              </Button>
            )}
            {dialog === "receive" ? (
              <Button
                color="primary"
                isLoading={!validCode && busy === "gift-code"}
                isDisabled={!!validCode && !!busy}
                onPress={() => {
                  if (!validCode) {
                    void run("gift-code", "/gift-code");
                    return;
                  }
                  void (async () => {
                    try {
                      await navigator.clipboard.writeText(validCode.code);
                      setNotice("copied");
                      setError(undefined);
                    } catch {
                      setError({ status: 0, action: "gift-code" });
                    }
                  })();
                }}
              >
                {validCode ? (notice === "copied" ? copy.copied : copy.copy) : copy.generate}
              </Button>
            ) : (
              <Button
                color="primary"
                isLoading={busy === "gift"}
                isDisabled={!state?.giftable || !/^[a-z\d]{32}$/i.test(giftInput.trim())}
                onPress={() => {
                  if (state?.giftable) void run("gift", `/${state.giftable.uuid}/gift`, { code: giftInput.trim() });
                }}
              >
                {copy.send}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}

function GiftRow({
  title,
  body,
  disabled,
  onPress,
}: {
  title: string;
  body: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <Icon icon={giftIcon} className="text-default-500 size-5 shrink-0" aria-hidden />
      <div className="min-w-36 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-default-600 text-sm">{body}</p>
      </div>
      <Button size="sm" variant="bordered" isDisabled={disabled} onPress={onPress}>
        {title}
      </Button>
    </div>
  );
}
