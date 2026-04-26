import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";
import Container from "./container";
import HeaderActions from "./header-actions";
import LanguageSwitcher from "./language-switcher";
import Nav from "./nav";
import ThemeSwitcher from "./theme-switcher";
import ThemedLogo from "./themed-logo";

const Header: FC = () => {
  const t = useTranslations();
  return (
    <header className="text-primary bg-background/90 fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-center font-semibold shadow-xs backdrop-blur-xs">
      <Container className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <ThemedLogo width={70} height={56.8} className="w-12 sm:w-16" />
          <div>
            <p className="hidden leading-4 uppercase sm:flex">{t("site.name")}</p>
            <p className="text-foreground hidden text-xs leading-4 sm:inline">{t("site.slogan")}</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Nav />
          <HeaderActions />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
};

export default Header;
