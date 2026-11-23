"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/react";
import arrowRightOnRectangleIcon from "@iconify-icons/heroicons/arrow-right-on-rectangle";
import chevronDownIcon from "@iconify-icons/heroicons/chevron-down";
import userIcon from "@iconify-icons/heroicons/user";
import { Icon } from "@iconify/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { ACCOUNT_NAV_ITEMS, isAccountNavigationActive } from "./account-navigation";

const HeaderActions: FC = () => {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const avatar = session?.user?.avatar?.trim();

  if (status === "loading") {
    return (
      <Button variant="flat" isIconOnly isDisabled aria-busy="true" aria-label={t("common.account")}>
        <Icon icon={userIcon} className="size-6" />
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button
        variant="flat"
        as={Link}
        href="/auth/sign-in"
        aria-label={t("common.login")}
        title={t("common.login")}
        isIconOnly
      >
        <Icon icon={userIcon} className="size-6" />
      </Button>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button variant="flat" aria-label={t("common.account")} className="min-w-10 gap-2 px-2 sm:px-3">
          {avatar ? (
            <Avatar
              src={avatar}
              alt=""
              aria-hidden="true"
              className="size-6 shrink-0"
              showFallback
              fallback={<Icon icon={userIcon} className="size-6" />}
            />
          ) : (
            <Icon icon={userIcon} className="size-6 shrink-0" />
          )}
          <span className="hidden sm:inline">{t("common.account")}</span>
          <Icon icon={chevronDownIcon} className="hidden size-4 sm:block" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("common.account")}
        variant="flat"
        className="min-w-56"
        onAction={(key) => {
          if (key === "signout") void signOut();
        }}
      >
        <DropdownSection showDivider>
          {ACCOUNT_NAV_ITEMS.map((item) => (
            <DropdownItem
              key={item.key}
              as={Link}
              href={item.href}
              startContent={<Icon icon={item.icon} className="size-5 shrink-0" />}
              aria-current={isAccountNavigationActive(pathname, item.href) ? "page" : undefined}
              className={isAccountNavigationActive(pathname, item.href) ? "bg-primary/10 text-primary" : undefined}
            >
              {t(`account.dashboard.nav.${item.key}`)}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownItem
          key="signout"
          color="danger"
          className="text-danger"
          startContent={<Icon icon={arrowRightOnRectangleIcon} className="size-5 rtl:rotate-180" />}
        >
          {t("account.dashboard.nav.signout")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default HeaderActions;
