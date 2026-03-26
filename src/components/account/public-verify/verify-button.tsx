"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  user: ESUser;
};

const VerifyButton: FC<Props> = ({ user }) => {
  const serverErrors = useServerError();
  const locale = useLocale();
  const [counter, setCounter] = useState(10);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const session = useSession();
  const t = useTranslations("publicVerify");

  useEffect(() => {
    const interval = setInterval(() => {
      if (counter > 0) {
        setCounter((prev) => prev - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    if (session.status !== "authenticated") {
      toast.error(t("loginToVerify"));
      return;
    }
    if (user.uuid === session.data.user.uuid) {
      toast.error(t("cannotVerifyOwnProfile"));
      return;
    }
    setLoading(true);
    try {
      const token = await generateToken("verify_profile");
      const response = await fetch("/api/account/profile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ uuid: user.uuid, recaptcha_token: token }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(t("profileVerified"));
        onOpenChange();
      } else {
        toast.error(serverErrors(data.messages[0]));
      }
    } catch {
      toast.error(serverErrors("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" fullWidth onPress={onOpen} isLoading={loading}>
        {t("verify", { name: "" })}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("verify", {
                  name: `${user.name} ${user.surname}`,
                })}
              </ModalHeader>
              <ModalBody>
                <p>{t("rules.content1")}</p>
                <p>{t("rules.content2")}</p>
                <p>{t("rules.content3")}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose} fullWidth>
                  {t("cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={verify}
                  isLoading={loading}
                  fullWidth
                  isDisabled={counter > 0 || loading}
                >
                  {`${t("verify", { name: "" })}${
                    counter > 0 ? ` (${counter})` : ""
                  }`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VerifyButton;
