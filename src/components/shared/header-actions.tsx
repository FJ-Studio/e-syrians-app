"use client";
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
  const t = useTranslations();
  return (
    <Button
      variant="flat"
      as={Link}
      href="/auth/signin"
      aria-label={t("common.login")}
    >
      {t("common.login")}
    </Button>
  );
};

export default HeaderActions;
