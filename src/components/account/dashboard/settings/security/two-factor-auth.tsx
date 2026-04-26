"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  useDisclosure,
} from "@heroui/react";
import copyIcon from "@iconify-icons/solar/copy-bold";
import keyMinimalisticIcon from "@iconify-icons/solar/key-minimalistic-bold";
import refreshIcon from "@iconify-icons/solar/refresh-bold";
import shieldCrossIcon from "@iconify-icons/solar/shield-cross-bold";
import shieldPlusIcon from "@iconify-icons/solar/shield-plus-bold";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type TwoFactorStatus = {
  enabled: boolean;
  confirmed_at: string | null;
};

type SetupData = {
  secret: string;
  qr_code: string;
};

const TwoFactorAuth: FC = () => {
  const t = useTranslations("account.dashboard.security.twoFactor");
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Disable state
  const disableModal = useDisclosure();
  const [disableCode, setDisableCode] = useState("");
  const [disableIsRecovery, setDisableIsRecovery] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  // Recovery codes state
  const recoveryModal = useDisclosure();
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [regenerateLoading, setRegenerateLoading] = useState(false);

  const [fetchKey, setFetchKey] = useState(0);

  const refetchStatus = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/security/2fa/status");
        const data = await res.json();
        if (data?.success && !cancelled) {
          setStatus(data.data);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const handleSetup = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch("/api/account/security/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.success) {
        setSetupData(data.data);
      } else {
        toast.error(t("errors.setupFailed"));
      }
    } catch {
      toast.error(t("errors.setupFailed"));
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (setupCode.length !== 6) return;
    setConfirmLoading(true);
    try {
      const res = await fetch("/api/account/security/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(t("success.enabled"));
        setRecoveryCodes(data.data.recovery_codes || []);
        setSetupData(null);
        setSetupCode("");
        recoveryModal.onOpen();
        refetchStatus();
      } else {
        toast.error(t("errors.confirmFailed"));
      }
    } catch {
      toast.error(t("errors.confirmFailed"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disableCode) return;
    setDisableLoading(true);
    try {
      const res = await fetch("/api/account/security/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: disableCode,
          is_recovery_code: disableIsRecovery,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(t("success.disabled"));
        disableModal.onClose();
        setDisableCode("");
        setDisableIsRecovery(false);
        refetchStatus();
      } else {
        toast.error(t("errors.disableFailed"));
      }
    } catch {
      toast.error(t("errors.disableFailed"));
    } finally {
      setDisableLoading(false);
    }
  };

  const handleViewRecoveryCodes = async () => {
    try {
      const res = await fetch("/api/account/security/recovery-codes");
      const data = await res.json();
      if (data?.success) {
        setRecoveryCodes(data.data.recovery_codes || []);
        recoveryModal.onOpen();
      }
    } catch {
      toast.error("Failed to load recovery codes");
    }
  };

  const handleRegenerateCodes = async () => {
    if (!confirm(t("recoveryCodes.regenerateConfirm"))) return;
    setRegenerateLoading(true);
    try {
      const res = await fetch("/api/account/security/recovery-codes/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.success) {
        setRecoveryCodes(data.data.recovery_codes || []);
        toast.success("Recovery codes regenerated");
      }
    } catch {
      toast.error("Failed to regenerate codes");
    } finally {
      setRegenerateLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success(t("recoveryCodes.copied"));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
          <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
          <p className="text-default-500 text-sm">{t("description")}</p>
        </CardHeader>
        <CardBody>
          <div className="bg-default-100 h-20 animate-pulse rounded-lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
          <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
          <p className="text-default-500 text-sm">{t("description")}</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <Chip
              color={status?.enabled ? "success" : "default"}
              variant="flat"
              startContent={
                <Icon
                  icon={status?.enabled ? "solar:shield-check-bold" : "solar:shield-minimalistic-bold"}
                  width={16}
                />
              }
            >
              {status?.enabled ? t("enabled") : t("disabled")}
            </Chip>
          </div>

          {/* Setup flow */}
          {!status?.enabled && !setupData && (
            <Button
              color="primary"
              variant="flat"
              onPress={handleSetup}
              isLoading={setupLoading}
              startContent={!setupLoading && <Icon icon={shieldPlusIcon} width={18} height={18} />}
            >
              {t("enable")}
            </Button>
          )}

          {/* QR Code and confirmation */}
          {!status?.enabled && setupData && (
            <div className="bg-default-50 border-default-200 space-y-4 rounded-lg border p-4">
              <p className="text-sm font-medium">{t("setup.title")}</p>
              <ol className="text-default-600 list-inside list-decimal space-y-1 text-sm">
                <li>{t("setup.step1")}</li>
                <li>{t("setup.step2")}</li>
                <li>{t("setup.step3")}</li>
              </ol>

              {/* QR Code — the backend returns a data URL, so next/image's
                  optimization pipeline doesn't apply. Plain <img> is correct. */}
              <div className="flex justify-center rounded-lg bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setupData.qr_code} alt="2FA QR Code" className="h-48 w-48" />
              </div>

              {/* Secret key */}
              <div>
                <p className="text-default-500 mb-1 text-xs">{t("setup.secretKey")}</p>
                <Snippet symbol="" variant="flat" size="sm" className="w-full">
                  {setupData.secret}
                </Snippet>
              </div>

              {/* Verification code input */}
              <div className="flex gap-2">
                <Input
                  value={setupCode}
                  onValueChange={setSetupCode}
                  label={t("setup.verificationCode")}
                  maxLength={6}
                  pattern="\d{6}"
                  className="flex-1"
                />
                <Button
                  color="primary"
                  onPress={handleConfirm}
                  isLoading={confirmLoading}
                  isDisabled={setupCode.length !== 6}
                  className="self-end"
                >
                  {t("setup.confirm")}
                </Button>
              </div>

              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  setSetupData(null);
                  setSetupCode("");
                }}
              >
                {t("setup.cancel")}
              </Button>
            </div>
          )}

          {/* Enabled state: show disable + recovery codes buttons */}
          {status?.enabled && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="flat"
                size="sm"
                onPress={handleViewRecoveryCodes}
                startContent={<Icon icon={keyMinimalisticIcon} width={16} height={16} />}
              >
                {t("recoveryCodes.title")}
              </Button>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                onPress={disableModal.onOpen}
                startContent={<Icon icon={shieldCrossIcon} width={16} height={16} />}
              >
                {t("disable")}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Disable 2FA Modal */}
      <Modal isOpen={disableModal.isOpen} onClose={disableModal.onClose}>
        <ModalContent>
          <ModalHeader>{t("disableModal.title")}</ModalHeader>
          <ModalBody>
            <p className="text-default-500 text-sm">{t("disableModal.description")}</p>
            <Input
              value={disableCode}
              onValueChange={setDisableCode}
              label={t("disableModal.code")}
              maxLength={disableIsRecovery ? 14 : 6}
            />
            <Button
              variant="light"
              size="sm"
              onPress={() => {
                setDisableIsRecovery(!disableIsRecovery);
                setDisableCode("");
              }}
            >
              {disableIsRecovery ? t("disableModal.useAuthenticatorCode") : t("disableModal.useRecoveryCode")}
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={disableModal.onClose}>
              {t("setup.cancel")}
            </Button>
            <Button color="danger" onPress={handleDisable} isLoading={disableLoading} isDisabled={!disableCode}>
              {t("disableModal.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recovery Codes Modal */}
      <Modal isOpen={recoveryModal.isOpen} onClose={recoveryModal.onClose} size="lg">
        <ModalContent>
          <ModalHeader>{t("recoveryCodes.title")}</ModalHeader>
          <ModalBody>
            <p className="text-default-500 text-sm">{t("recoveryCodes.description")}</p>
            <div className="bg-default-50 grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="py-1 text-center">
                  {code}
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              size="sm"
              onPress={copyRecoveryCodes}
              startContent={<Icon icon={copyIcon} width={16} height={16} />}
            >
              {t("recoveryCodes.copy")}
            </Button>
            <Button
              variant="flat"
              size="sm"
              color="warning"
              onPress={handleRegenerateCodes}
              isLoading={regenerateLoading}
              startContent={!regenerateLoading && <Icon icon={refreshIcon} width={16} height={16} />}
            >
              {t("recoveryCodes.regenerate")}
            </Button>
            <Button color="primary" onPress={recoveryModal.onClose}>
              {t("recoveryCodes.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TwoFactorAuth;
