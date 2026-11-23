"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import bars3Icon from "@iconify-icons/heroicons/bars-3";
import xMarkIcon from "@iconify-icons/heroicons/x-mark";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";

const Nav: FC = () => {
  const t = useTranslations("header.nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { title: t("census"), link: "/census" },
    { title: t("polls"), link: "/polls" },
    { title: t("features"), link: "/feature-requests" },
  ];

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label={t("label")}>
      <div className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.link}
            href={link.link}
            aria-current={isActive(link.link) ? "page" : undefined}
            className={`hover:text-primary rounded-medium px-3 py-2 text-base font-normal whitespace-nowrap ${
              isActive(link.link) ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            {link.title}
          </Link>
        ))}
      </div>
      <div className="lg:hidden">
        <Dropdown placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
          <DropdownTrigger>
            <Button variant="flat" isIconOnly aria-label={t(isOpen ? "closeMenu" : "openMenu")}>
              <Icon icon={isOpen ? xMarkIcon : bars3Icon} className="size-6" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label={t("label")} variant="flat" onAction={() => setIsOpen(false)}>
            {links.map((link) => (
              <DropdownItem
                key={link.link}
                as={Link}
                href={link.link}
                aria-current={isActive(link.link) ? "page" : undefined}
                className={isActive(link.link) ? "bg-primary/10 text-primary" : undefined}
              >
                {link.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Nav;
