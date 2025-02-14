"use client";
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
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { toast } from "sonner";

type Props = {
  user: ESUser;
};

const VerifyButton: FC<Props> = ({ user }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const session = useSession();
  const t = useTranslations("publicVerify");

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
  };

  return (
    <>
      <Button color="primary" fullWidth onPress={onOpen} isLoading={loading}>
        {t("verify")}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("verify")} {user.name} {user.surname}
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
                >
                  {t("verify")}
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
