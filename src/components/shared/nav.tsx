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
          className="text-gray-800 font-normal px-2 sm:px-3 py-2 hover:text-primary"
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
