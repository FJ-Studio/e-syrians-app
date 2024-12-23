"use client";
import { Button } from "@nextui-org/react";
import { FC, ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { useTranslations } from "next-intl";

const InfoModal: FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const t = useTranslations();
    const info: Array<string | ReactNode> = [
    t('disarm.info_modal.content1'),
    t('disarm.info_modal.content2'),
    t('disarm.info_modal.content3'),
    ]
  return (
    <>
      <Button
        isIconOnly
        className="2"
        variant="solid"
        color="primary"
        onPress={onOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t('disarm.info_modal.title')}
              </ModalHeader>
              <ModalBody>
                {info.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="ghost" onPress={onClose}>
                  {t('common.close')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InfoModal;
