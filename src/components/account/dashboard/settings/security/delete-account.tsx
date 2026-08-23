"use client";

import useServerError from "@/components/hooks/localization/server-errors";
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
import trashIcon from "@iconify-icons/solar/trash-bin-trash-bold";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

/**
 * Two-stage account deletion — request + cancel. Sits at the bottom of
 * the security page as a destructive section. When the account has a
 * pending deletion, the destructive card flips to a red "Deletion
 * scheduled" banner with a "Cancel deletion" button; both actions
 * re-verify the user's password (defense against session hijack).
 *
 * Data-flow note: pending-deletion state has TWO sources:
 *   1) `session.user` from NextAuth — fast local mirror, updated
 *      in-place on request/cancel via `updateSession(...)`.
 *   2) `useSWR("/api/account/deletion/status")` — cross-device / cross-tab
 *      truth. If the user requested (or cancelled) deletion from mobile
 *      or another tab, the JWT here is stale until re-sign-in; SWR's
 *      `revalidateOnFocus` catches that when the tab regains focus.
 *
 * `fallbackData` seeds SWR from the session so the first render shows
 * the correct state instantly — SWR then refreshes in the background,
 * and any drift snaps to the fresh backend truth. We keep the write
 * paths writing to BOTH session (fast path for this tab) and mutating
 * the SWR key (so the new value doesn't get overwritten by the in-
 * flight background revalidate).
 *
 * The set-state-in-effect lint rule stays satisfied — SWR owns the
 * fetch + storage; no `useEffect(setState)` here.
 *
 * Social-only signups (Google / Apple, no password ever set) can't
 * satisfy the API's `Hash::check` gate on request-deletion. Rather than
 * let them run into a 422 dead-end, we branch to a "set a password
 * first" card that deep-links to the security section that already
 * hosts the set-password flow. The backend still enforces the password
 * requirement on write; this branch is purely UX correctness.
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
  // The proxy route wraps in the standard `{ success, data, messages }`
  // envelope — unwrap to the raw status shape.
  return response?.data as DeletionStatus;
};
const DeleteAccount: FC = () => {
  const t = useTranslations("account.dashboard.security.deleteAccount");
  const serverErrors = useServerError();
  const { data: session, update: updateSession } = useSession();

  const requestModal = useDisclosure();
  const cancelModal = useDisclosure();

  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Session values are the fast local mirror + SWR fallback seed. SWR
  // owns the source of truth for cross-device staleness — if mobile /
  // another tab scheduled or cancelled a deletion, the JWT here is
  // stale until re-sign-in, and `revalidateOnFocus` catches it.
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

  // Prefer SWR's live value; fall back to session for the first render
  // before the fetch resolves (fallbackData already covers that when
  // the session is available).
  const hasPassword = status?.requires_password ?? sessionUser?.has_password !== false;
  const deletionScheduledFor = status?.deletion_scheduled_for ?? sessionUser?.deletion_scheduled_for ?? null;
  const isPending = status?.is_pending ?? !!deletionScheduledFor;
  const scheduledFor = deletionScheduledFor ? new Date(deletionScheduledFor) : null;

  // Openers that reset the form state imperatively. Previously done in
  // a `useEffect` keyed on `isOpen`; that pattern trips the
  // set-state-in-effect rule and rerenders once per open. Doing it in
  // the open handler is both quieter and semantically clearer — the
  // reset is a consequence of the open action, not a synchronization
  // side-effect.
  const openRequestModal = () => {
    setPassword("");
    setConfirmed(false);
    requestModal.onOpen();
  };
  const openCancelModal = () => {
    setPassword("");
    setConfirmed(false);
    cancelModal.onOpen();
  };

  const handleRequestDeletion = async () => {
    if (!password || !confirmed || submitting) return;
    setSubmitting(true);
    try {
      const token = await generateToken("request_deletion");
      const request = await fetch("/api/account/deletion/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, recaptcha_token: token }),
      });
      const response = await request.json();
      if (response?.success) {
        toast.success(t("successToast"));
        // Fast path: push new timestamps into the JWT so this tab
        // flips to the scheduled-deletion branch without a round-trip.
        await updateSession({
          deletion_requested_at: response.data?.deletion_requested_at ?? null,
          deletion_scheduled_for: response.data?.deletion_scheduled_for ?? null,
        });
        // Truth path: seed the SWR cache with the write response so
        // the in-flight background revalidate doesn't overwrite the
        // fresh value with a stale one. `false` prevents an immediate
        // re-fetch — we already have the authoritative payload.
        await mutateStatus(
          {
            deletion_requested_at: response.data?.deletion_requested_at ?? null,
            deletion_scheduled_for: response.data?.deletion_scheduled_for ?? null,
            is_pending: !!response.data?.deletion_scheduled_for,
            requires_password: !!response.data?.requires_password,
          },
          false,
        );
        requestModal.onClose();
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0]));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeletion = async () => {
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
        toast.success(t("cancelSuccess"));
        await updateSession({
          deletion_requested_at: null,
          deletion_scheduled_for: null,
        });
        // Truth path: mirror the cancel into the SWR cache so a
        // background revalidate can't stomp back the just-cleared
        // timestamps. See handleRequestDeletion for the same pattern.
        await mutateStatus(
          {
            deletion_requested_at: null,
            deletion_scheduled_for: null,
            is_pending: false,
            requires_password: hasPassword,
          },
          false,
        );
        cancelModal.onClose();
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0]));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Social-only (no password) — must set a password before they can
  // delete. Backend `Hash::check` would 422 with `invalid_password`
  // otherwise. The set-password flow lives elsewhere on the same
  // security page (rendered by `UpdatePassword`), so we hint at that.
  if (!hasPassword) {
    return (
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-row items-start gap-3 border-b">
          <Icon icon={keyIcon} className="text-default-600 mt-1 shrink-0" width={22} />
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-default-700 text-lg font-medium">{t("noPasswordTitle")}</h3>
            <p className="text-default-500 text-sm">{t("noPasswordDescription")}</p>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col items-start gap-3">
          <p className="text-default-600 text-sm">{t("noPasswordBody")}</p>
        </CardBody>
      </Card>
    );
  }

  if (isPending) {
    return (
      <>
        <Card>
          <CardHeader className="border-b-danger-200 dark:border-b-danger-800 bg-danger-50 dark:bg-danger-900/20 flex flex-row items-start gap-3 border-b">
            <Icon icon={warningIcon} className="text-danger mt-1 shrink-0" width={22} />
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-danger text-lg font-medium">{t("scheduledTitle")}</h3>
              <p className="text-danger-700 dark:text-danger-300 text-sm">
                {t("scheduledDescription", {
                  date: scheduledFor
                    ? scheduledFor.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—",
                })}
              </p>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col items-start gap-3">
            <p className="text-default-600 text-sm">{t("cancelHint")}</p>
            <Button color="primary" variant="solid" onPress={openCancelModal}>
              {t("confirmCancelCta")}
            </Button>
          </CardBody>
        </Card>

        {/* Cancel-deletion modal */}
        <Modal isOpen={cancelModal.isOpen} onClose={cancelModal.onClose}>
          <ModalContent>
            <ModalHeader>{t("cancelTitle")}</ModalHeader>
            <ModalBody className="space-y-3">
              <p className="text-default-500 text-sm">{t("cancelBody")}</p>
              <Input
                type="password"
                label={t("password")}
                value={password}
                onValueChange={setPassword}
                isRequired
                autoComplete="current-password"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={cancelModal.onClose}>
                {t("close")}
              </Button>
              <Button
                color="primary"
                onPress={handleCancelDeletion}
                isDisabled={!password || submitting}
                isLoading={submitting}
              >
                {t("confirmCancelCta")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
          <h3 className="text-danger text-lg font-medium">{t("title")}</h3>
          <p className="text-default-500 text-sm">{t("description")}</p>
        </CardHeader>
        <CardBody className="flex flex-col items-start gap-3">
          <p className="text-default-600 text-sm">{t("body")}</p>
          <Button
            color="danger"
            variant="flat"
            startContent={<Icon icon={trashIcon} width={18} />}
            onPress={openRequestModal}
          >
            {t("cta")}
          </Button>
        </CardBody>
      </Card>

      {/* Request-deletion modal */}
      <Modal isOpen={requestModal.isOpen} onClose={requestModal.onClose}>
        <ModalContent>
          <ModalHeader className="text-danger flex items-center gap-2">
            <Icon icon={warningIcon} width={22} />
            {t("confirmTitle")}
          </ModalHeader>
          <ModalBody className="space-y-3">
            <p className="text-default-600 text-sm">{t("warningBody")}</p>
            <Input
              type="password"
              label={t("password")}
              value={password}
              onValueChange={setPassword}
              isRequired
              autoComplete="current-password"
            />
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-default-700">{t("acknowledgement")}</span>
            </label>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={requestModal.onClose}>
              {t("close")}
            </Button>
            <Button
              color="danger"
              onPress={handleRequestDeletion}
              isDisabled={!password || !confirmed || submitting}
              isLoading={submitting}
            >
              {t("confirmCta")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAccount;
