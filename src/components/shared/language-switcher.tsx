"use client";

import { LANGUAGES } from "@/lib/constants/misc";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import globeAltIcon from "@iconify-icons/heroicons/globe-alt";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { FC } from "react";

const LanguageSwitcher: FC = () => {
  const pathname = usePathname();
  const deleteLang = pathname.replace(/\/[a-z]{2}/, "");
  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button variant="flat" isIconOnly className="bg-primary text-white">
            <Icon icon={globeAltIcon} className="size-6" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          {Object.keys(LANGUAGES).map((lang) => (
            <DropdownItem key={lang} href={`/${lang}/${deleteLang}`}>
              {LANGUAGES[lang as keyof typeof LANGUAGES].label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageSwitcher;
