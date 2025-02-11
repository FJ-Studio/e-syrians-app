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
    <nav className="hidden sm:flex">
      {links.map((link) => (
        <Link
          key={link.link}
          href={link.link}
          className="text-gray-800 font-normal px-3 py-2 hover:text-primary"
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
