import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const Footer: FC = () => {
    const t = useTranslations();
  return (
    <footer className="bg-gray-100 text-white py-4">
      <div className="container mx-auto flex justify-between items-center max-w-7xl px-6 lg:px-8">
        <p className="text-black text-sm">© 2021 All rights reserved</p>
        <div className="flex items-center gap-3">
          <Link className="text-black text-sm" href="/privacy-policy" title={t('footer.privacy_policy')}>
          {t('footer.privacy_policy')}
          </Link>
          <Link className="text-black text-sm" href="/terms" title={t('footer.terms')}>
          {t('footer.terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
