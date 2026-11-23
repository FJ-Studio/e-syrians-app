"use client";

import { usePathname } from "@/i18n/routing";
import { LANGUAGES } from "@/lib/constants/misc";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import globeAltIcon from "@iconify-icons/heroicons/globe-alt";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const LanguageSwitcher: FC = () => {
  const pathname = usePathname();
  const t = useTranslations("header");
  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button variant="flat" isIconOnly aria-label={t("language")} className="bg-primary text-primary-foreground">
            <Icon icon={globeAltIcon} className="size-6" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label={t("language")} variant="flat">
          {Object.keys(LANGUAGES).map((lang) => (
            <DropdownItem key={lang} as={Link} href={`/${lang}${pathname === "/" ? "" : pathname}`} hrefLang={lang}>
              {LANGUAGES[lang as keyof typeof LANGUAGES].label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageSwitcher;
