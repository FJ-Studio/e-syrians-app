"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const Nav: FC = () => {
  const t = useTranslations("header.nav");
  const links = [
    { title: t("census"), link: "/census" },
    { title: t("polls"), link: "/polls" },
  ];
  return (
    <nav className="flex">
      {links.map((link) => (
        <Link
          key={link.link}
          href={link.link}
          className="hover:text-primary px-2 py-2 text-sm font-normal text-gray-800 sm:px-3 sm:text-base"
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
