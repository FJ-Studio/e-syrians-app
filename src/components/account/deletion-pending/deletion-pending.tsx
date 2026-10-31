"use client";

import useServerError from "@/components/hooks/localization/server-errors";
import { useRouter } from "@/i18n/routing";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import warningIcon from "@iconify-icons/solar/danger-triangle-bold";
import keyIcon from "@iconify-icons/solar/key-bold";
import { Icon } from "@iconify/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

/**
 * Deletion-pending screen.
 *
 * Terminal screen for accounts inside the 15-day grace period. The
 * dashboard-layout redirect guard forces navigation here whenever the
 * user's `deletion_scheduled_for` is non-null, and back to `/account`
 * the moment it becomes null again. The only legitimate exits are:
 *
 *   - Reactivate  → POST /api/account/deletion/cancel → clears the
 *                    flag on the JWT + SWR cache → guard releases us
 *                    to `/account`.
 *   - Sign out    → NextAuth signOut → auth stack.
 *
 * Social-only users (no password on file) can't satisfy the API's
 * `Hash::check` on cancel-deletion. This state is unreachable in
 * practice — the request-deletion CTA also gates on `hasPassword` so
 * a social-only user can never initiate deletion in the first place —
 * but we keep the fallback branch as a defensive read of the server
 * status. It's an honest terminal state: sign-out is the only exit
 * we can offer without a set-password flow inline here.
 */

interface DeletionStatus {
  deletion_requested_at: string | null;
  deletion_scheduled_for: string | null;
  is_pending: boolean;
  requires_password: boolean;
}

const DELETION_STATUS_KEY = "/api/account/deletion/status";

const fetchDeletionStatus = async (url: string): Promise<DeletionStatus> => {
  const request = await fetch(url, { credentials: "same-origin" });
  const response = await request.json();
  return response?.data as DeletionStatus;
};

const DeletionPending: FC = () => {
  const t = useTranslations("account.deletionPending");
  const tCommon = useTranslations("common");
  const serverErrors = useServerError();
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const reactivateModal = useDisclosure();

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sessionUser = session?.user;
  const { data: status, mutate: mutateStatus } = useSWR<DeletionStatus>(DELETION_STATUS_KEY, fetchDeletionStatus, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 30_000,
    fallbackData: sessionUser
      ? {
          deletion_requested_at: sessionUser.deletion_requested_at ?? null,
          deletion_scheduled_for: sessionUser.deletion_scheduled_for ?? null,
          is_pending: !!sessionUser.deletion_scheduled_for,
          requires_password: sessionUser.has_password !== false,
        }
      : undefined,
  });

  const hasPassword = status?.requires_password ?? sessionUser?.has_password !== false;
  const deletionScheduledFor = status?.deletion_scheduled_for ?? sessionUser?.deletion_scheduled_for ?? null;
  const scheduledFor = useMemo(
    () => (deletionScheduledFor ? new Date(deletionScheduledFor) : null),
    [deletionScheduledFor],
  );

  // `Date.now()` is impure and can't be called during render — React
  // 19's `react-hooks/purity` + `set-state-in-effect` rules block
  // both the naïve render-time calc AND the pull-in-effect variant.
  // Subscribe pattern: a one-shot interval ticker lets React treat
  // this as syncing to an external system (the wall clock), which
  // is the sanctioned use of setState from inside an effect.
  //
  // Lazy state initializer captures the clock once at mount so the
  // first paint already has a real number, then the interval keeps
  // it accurate across an open browser tab (rehydrating a stale
  // "3 days" while the user leaves the screen open past midnight).
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const daysRemaining = useMemo(() => {
    if (!scheduledFor) return 0;
    const diffMs = scheduledFor.getTime() - nowMs;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [scheduledFor, nowMs]);

  const openReactivateModal = () => {
    setPassword("");
    reactivateModal.onOpen();
  };

  const handleReactivate = async () => {
    if (!password || submitting) return;
    setSubmitting(true);
    try {
      const token = await generateToken("cancel_deletion");
      const request = await fetch("/api/account/deletion/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, recaptcha_token: token }),
      });
      const response = await request.json();
      if (response?.success) {
        toast.success(t("reactivate_success"));
        // Fast path: clear the JWT mirror so the redirect guard in
        // the dashboard layout releases us. Truth path: seed the SWR
        // cache so a background revalidate can't stomp back the just-
        // cleared timestamps (same pattern as delete-account.tsx).
        await updateSession({
          deletion_requested_at: null,
          deletion_scheduled_for: null,
        });
        await mutateStatus(
          {
            deletion_requested_at: null,
            deletion_scheduled_for: null,
            is_pending: false,
            requires_password: hasPassword,
          },
          false,
        );
        reactivateModal.onClose();
        // Belt-and-suspenders: the guard will also push us here on
        // the next render, but an explicit replace guarantees the
        // user lands on /account immediately without a visible flash
        // of this screen.
        router.replace("/account");
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0] ?? "unknown_error") || t("reactivate_error"));
      }
    } catch {
      toast.error(t("reactivate_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formattedDate = scheduledFor
    ? scheduledFor.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader className="border-b-danger-200 dark:border-b-danger-800 bg-danger-50 dark:bg-danger-900/20 flex flex-row items-start gap-3 border-b">
          <Icon icon={warningIcon} className="text-danger mt-1 shrink-0" width={28} />
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-danger text-lg font-semibold">{t("title")}</h3>
            <p className="text-danger-700 dark:text-danger-300 text-sm">{t("subtitle")}</p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col items-start gap-4">
          <div className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/10 rounded-medium flex w-full flex-col gap-1 border p-3">
            <span className="text-danger font-medium">{t("scheduled_for", { date: formattedDate })}</span>
            <span className="text-danger-700 dark:text-danger-300 text-sm">
              {t("days_remaining", { count: daysRemaining })}
            </span>
          </div>

          {!hasPassword ? (
            // Defensive fallback — unreachable in practice because the
            // request-deletion CTA on the security page also gates on
            // `hasPassword`. If we somehow get here, we can't offer a
            // working reactivate flow (cancel-deletion requires a
            // password we don't have and can't set here). Sign-out is
            // the only honest exit.
            <div className="rounded-medium border-default-200 bg-default-50 flex w-full flex-col items-start gap-3 border p-4">
              <div className="flex items-start gap-2">
                <Icon icon={keyIcon} className="text-default-600 mt-1 shrink-0" width={20} />
                <div className="flex flex-col gap-1">
                  <h4 className="text-default-700 font-medium">{t("no_password_title")}</h4>
                  <p className="text-default-500 text-sm">{t("no_password_body")}</p>
                </div>
              </div>
            </div>
          ) : (
            <Button color="primary" variant="solid" onPress={openReactivateModal}>
              {t("reactivate_cta")}
            </Button>
          )}

          <Button color="default" variant="light" onPress={handleSignOut}>
            {t("sign_out_cta")}
          </Button>
        </CardBody>
      </Card>

      <Modal isOpen={reactivateModal.isOpen} onClose={reactivateModal.onClose}>
        <ModalContent>
          <ModalHeader>{t("reactivate_cta")}</ModalHeader>
          <ModalBody className="space-y-3">
            <p className="text-default-500 text-sm">{t("subtitle")}</p>
            <Input
              type="password"
              label={t("password_label")}
              value={password}
              onValueChange={setPassword}
              isRequired
              autoComplete="current-password"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={reactivateModal.onClose}>
              {tCommon("close")}
            </Button>
            <Button
              color="primary"
              onPress={handleReactivate}
              isDisabled={!password || submitting}
              isLoading={submitting}
            >
              {t("reactivate_cta")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DeletionPending;
