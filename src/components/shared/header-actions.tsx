'use client';
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
    const t = useTranslations();
    return (
        <Button as={Link} href="/auth/signin">{t('common.login')}</Button>
    )
}

export default HeaderActions;