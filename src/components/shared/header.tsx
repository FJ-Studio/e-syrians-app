import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import Container from "./container";
import HeaderActions from "./header-actions";
import LanguageSwitcher from "./language-switcher";
import Nav from "./nav";

const Header: FC = () => {
  const t = useTranslations();
  return (
    <header className="text-primary fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-center bg-white/90 font-semibold shadow-xs backdrop-blur-xs">
      <Container className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/icon.svg" alt="Logo" width={70} height={56.8} className="w-12 sm:w-16" />
          <div>
            <p className="hidden leading-4 uppercase sm:flex">{t("site.name")}</p>
            <p className="hidden text-xs leading-4 text-black sm:inline">{t("site.slogan")}</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Nav />
          <HeaderActions />
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
};

export default Header;
