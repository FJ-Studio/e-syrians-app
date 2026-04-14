"use client";
import { Button } from "@heroui/react";
import userIcon from "@iconify-icons/heroicons/user";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
  const t = useTranslations();
  return (
    <>
      <Button variant="flat" as={Link} href="/account" aria-label={t("common.login")} isIconOnly>
        <Icon icon={userIcon} className="size-6" />
      </Button>
    </>
  );
};

export default HeaderActions;
