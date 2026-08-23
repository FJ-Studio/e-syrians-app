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
import trashIcon from "@iconify-icons/solar/trash-bin-trash-bold";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { toast } from "sonner";

/**
 * Request-side of the two-stage account deletion. Sits at the bottom of
 * the security page as a destructive section. On success we push the
 * timestamps into the session + navigate to /account/deletion-pending;
 * the DashboardLayout guard also enforces that redirect as a safety net
 * (invariant: any signed-in user with a non-null
 * `deletion_scheduled_for` must be on /account/deletion-pending).
 *
 * The pending-state branch that used to live in this component has
 * moved wholesale to `<DeletionPending>` (mounted at
 * `/account/deletion-pending`). This component only ever renders in
 * the "not pending" state now — a pending user never sees this screen
 * because the layout guard forcibly redirects them off /account
 * routes.
 *
 * Social-only signups (Google / Apple, no password ever set) can't
 * satisfy the API's `Hash::check` gate on request-deletion. Rather
 * than let them run into a 422 dead-end, we branch to a "set a
 * password first" card. The backend still enforces the password
 * requirement on write; this branch is purely UX correctness.
 */

const DeleteAccount: FC = () => {
  const t = useTranslations("account.dashboard.security.deleteAccount");
  const serverErrors = useServerError();
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const requestModal = useDisclosure();

  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sessionUser = session?.user;
  const hasPassword = sessionUser?.has_password !== false;

  const openRequestModal = () => {
    setPassword("");
    setConfirmed(false);
    requestModal.onOpen();
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
        // Push new timestamps into the JWT — the DashboardLayout
        // redirect guard watches these and force-navigates to
        // /account/deletion-pending on the next render as a safety
        // net. The explicit `router.replace` below is the fast path
        // so the user doesn't see a flash of this screen before the
        // guard fires.
        await updateSession({
          deletion_requested_at: response.data?.deletion_requested_at ?? null,
          deletion_scheduled_for: response.data?.deletion_scheduled_for ?? null,
        });
        requestModal.onClose();
        router.replace("/account/deletion-pending");
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0] ?? "unknown_error"));
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
