"use client";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
  const session = useSession();
  console.log(session);
  const t = useTranslations();
  return (
    <>
      {session.status === "unauthenticated" ? (
        <Button
          variant="flat"
          as={Link}
          href="/auth/signin"
          aria-label={t("common.login")}
        >
          {t("common.login")}
        </Button>
      ) : (
        <Button
          variant="flat"
          as={Link}
          href="/account"
          aria-label={t("common.account")}
        >
          {t("common.account")}
        </Button>
      )}
    </>
  );
};

export default HeaderActions;
