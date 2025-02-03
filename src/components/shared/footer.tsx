import { initiatives } from "@/lib/constants";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

const Footer: FC = () => {
  const t = useTranslations();
  return (
    <footer className="bg-gray-100 text-black py-4">
      <div className="container mx-auto flex gap-5 flex-col md:flex-row justify-between items-start max-w-7xl px-6 lg:px-8">
        <p className="text-sm">© 2021 {t("footer.all_rights_reserved")}</p>
        <div className="flex items-start gap-3 md:gap-12">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-semibold">{t("footer.initiatives")}</h4>
            {initiatives.map((initiative, index) => (
              <Link
                key={index}
                className="text-black text-sm"
                href={initiative.link}
                title={t(initiative.title)}
              >
                {t(initiative.title)}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-semibold">{t("footer.links")}</h4>
            <Link
              className="text-black text-sm"
              href="/privacy-policy"
              title={t("footer.privacy_policy")}
            >
              {t("footer.privacy_policy")}
            </Link>
            <Link
              className="text-black text-sm"
              href="/terms"
              title={t("footer.terms")}
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
