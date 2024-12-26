import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import LanguageSwitcher from "./language-switcher";
// import HeaderActions from "./header-actions";

const Header: FC = () => {
  const t = useTranslations();
  return (
    <header className="flex justify-center items-center h-20 bg-white/20 backdrop-blur-sm text-primary font-semibold w-full fixed top-0 left-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-7xl px-6 lg:px-8">
        <Link href='/' className="flex items-center gap-3">
          <Image 
            src="/icon.svg"
            alt="Logo"
            width={70}
            height={56.8} />
            <div>
              <p className="uppercase leading-4">{t('site.name')}</p>
              <p className="hidden sm:inline text-xs text-black leading-4">{t('site.slogan')}</p>
            </div>
        </Link>
        <div className="flex items-center gap-3">
          {/* <HeaderActions /> */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
