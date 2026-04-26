"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import computerDesktopIcon from "@iconify-icons/heroicons/computer-desktop";
import moonIcon from "@iconify-icons/heroicons/moon";
import sunIcon from "@iconify-icons/heroicons/sun";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { FC, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

const ThemeSwitcher: FC = () => {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getTrue, getFalse);
  const t = useTranslations("header.theme");

  if (!mounted) {
    return (
      <Button variant="light" isIconOnly aria-label={t("label")}>
        <Icon icon={sunIcon} className="size-5" />
      </Button>
    );
  }

  const currentIcon = theme === "dark" ? moonIcon : theme === "light" ? sunIcon : computerDesktopIcon;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button variant="light" isIconOnly aria-label={t("label")}>
          <Icon icon={currentIcon} className="size-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("selection")}
        selectionMode="single"
        selectedKeys={new Set([theme ?? "system"])}
        onAction={(key) => setTheme(key as string)}
      >
        <DropdownItem key="light" startContent={<Icon icon={sunIcon} className="size-4" />}>
          {t("light")}
        </DropdownItem>
        <DropdownItem key="dark" startContent={<Icon icon={moonIcon} className="size-4" />}>
          {t("dark")}
        </DropdownItem>
        <DropdownItem key="system" startContent={<Icon icon={computerDesktopIcon} className="size-4" />}>
          {t("system")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeSwitcher;
