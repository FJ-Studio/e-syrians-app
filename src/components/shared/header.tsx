import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import LanguageSwitcher from "./language-switcher";
import HeaderActions from "./header-actions";
import Nav from "./nav";
import Container from "./container";

const Header: FC = () => {
  const t = useTranslations();
  return (
    <header className="shadow-sm flex justify-center items-center h-20 bg-white/90 backdrop-blur-sm text-primary font-semibold w-full fixed top-0 left-0 z-50">
      <Container className="flex justify-between items-center w-full">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="Logo"
            width={70}
            height={56.8}
            className="w-12 sm:w-16"
          />
          <div>
            <p className="hidden sm:flex uppercase leading-4">
              {t("site.name")}
            </p>
            <p className="hidden sm:inline text-xs text-black leading-4">
              {t("site.slogan")}
            </p>
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
