"use client";
import { UserIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
  const t = useTranslations();
  return (
    <>
      <Button
        variant="flat"
        as={Link}
        href="/account"
        aria-label={t("common.login")}
        isIconOnly
      >
        <UserIcon className="size-6" />
      </Button>
    </>
  );
};

export default HeaderActions;
