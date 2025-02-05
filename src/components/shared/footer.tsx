import { INITIATIVES, INSTAGRAM_URL, X_URL } from "@/lib/constants/misc";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const Footer: FC = () => {
  const t = useTranslations();
  return (
    <footer className="bg-gray-100 text-black py-8">
      <div className="container mx-auto flex gap-5 flex-col md:flex-row justify-between items-start max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-gray-700 font-semibold">
            <Image src="/icon.svg" alt="Logo" width={40} height={32} />
            <div className="flex flex-col">
              <p className="text-sm uppercase">{t("site.name")}</p>
              <p className="text-xs">{t("site.slogan")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={X_URL} target="_blank" rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 16 16"
              >
                <path
                  className="fill-gray-700"
                  d="M9.294 6.928L14.357 1h-1.2L8.762 6.147L5.25 1H1.2l5.31 7.784L1.2 15h1.2l4.642-5.436L10.751 15h4.05zM7.651 8.852l-.538-.775L2.832 1.91h1.843l3.454 4.977l.538.775l4.491 6.47h-1.843z"
                />
              </svg>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  className="fill-gray-700"
                  d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.6 7.6 0 0 0-.46-2.43a4.9 4.9 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.8 4.8 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.8 4.8 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.6 7.6 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.6 5.6 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.2 3.2 0 0 1-1.15.75a5.6 5.6 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.7 5.7 0 0 1-1.94-.3a3.3 3.3 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.5 5.5 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.5 5.5 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.1 3.1 0 0 1 1.1-.8A5.7 5.7 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.6 5.6 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.1 3.1 0 0 1 .75 1.1a5.6 5.6 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33"
                />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 md:gap-12">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-semibold">{t("footer.initiatives")}</h4>
            {INITIATIVES.map((initiative, index) => (
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
