"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Snippet,
  useDisclosure,
} from "@heroui/react";
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

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/account/security/2fa/status");
      const data = await res.json();
      if (data?.success) {
        setStatus(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

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
        fetchStatus();
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
        fetchStatus();
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
      const res = await fetch(
        "/api/account/security/recovery-codes/regenerate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
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
        <CardHeader className="text-default-700 font-medium">
          {t("title")}
        </CardHeader>
        <CardBody>
          <div className="animate-pulse h-20 bg-default-100 rounded-lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="text-default-700 font-medium">
          {t("title")}
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-default-500">{t("description")}</p>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <Chip
              color={status?.enabled ? "success" : "default"}
              variant="flat"
              startContent={
                <Icon
                  icon={
                    status?.enabled
                      ? "solar:shield-check-bold"
                      : "solar:shield-minimalistic-bold"
                  }
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
              startContent={
                !setupLoading && (
                  <Icon icon="solar:shield-plus-bold" width={18} />
                )
              }
            >
              {t("enable")}
            </Button>
          )}

          {/* QR Code and confirmation */}
          {!status?.enabled && setupData && (
            <div className="space-y-4 p-4 bg-default-50 rounded-lg border border-default-200">
              <p className="text-sm font-medium">{t("setup.title")}</p>
              <ol className="text-sm text-default-600 space-y-1 list-decimal list-inside">
                <li>{t("setup.step1")}</li>
                <li>{t("setup.step2")}</li>
                <li>{t("setup.step3")}</li>
              </ol>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={setupData.qr_code}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>

              {/* Secret key */}
              <div>
                <p className="text-xs text-default-500 mb-1">
                  {t("setup.secretKey")}
                </p>
                <Snippet
                  symbol=""
                  variant="flat"
                  size="sm"
                  className="w-full"
                >
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
                startContent={
                  <Icon icon="solar:key-minimalistic-bold" width={16} />
                }
              >
                {t("recoveryCodes.title")}
              </Button>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                onPress={disableModal.onOpen}
                startContent={
                  <Icon icon="solar:shield-cross-bold" width={16} />
                }
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
            <p className="text-sm text-default-500">
              {t("disableModal.description")}
            </p>
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
              {disableIsRecovery
                ? t("disableModal.useAuthenticatorCode")
                : t("disableModal.useRecoveryCode")}
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={disableModal.onClose}>
              {t("setup.cancel")}
            </Button>
            <Button
              color="danger"
              onPress={handleDisable}
              isLoading={disableLoading}
              isDisabled={!disableCode}
            >
              {t("disableModal.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recovery Codes Modal */}
      <Modal
        isOpen={recoveryModal.isOpen}
        onClose={recoveryModal.onClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>{t("recoveryCodes.title")}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              {t("recoveryCodes.description")}
            </p>
            <div className="grid grid-cols-2 gap-2 p-4 bg-default-50 rounded-lg font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="text-center py-1">
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
              startContent={<Icon icon="solar:copy-bold" width={16} />}
            >
              {t("recoveryCodes.copy")}
            </Button>
            <Button
              variant="flat"
              size="sm"
              color="warning"
              onPress={handleRegenerateCodes}
              isLoading={regenerateLoading}
              startContent={
                !regenerateLoading && (
                  <Icon icon="solar:refresh-bold" width={16} />
                )
              }
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
