import { FACEBOOK_URL, INSTAGRAM_URL, X_URL } from "@/lib/constants/misc";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import useInitiatives from "../hooks/localization/initiatives";
import Container from "./container";

const Footer: FC = () => {
  const t = useTranslations();
  const INITIATIVES = useInitiatives();
  return (
    <footer className="bg-gray-100 py-8 text-black">
      <Container className="flex flex-col items-start justify-between gap-5 sm:flex-row">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 font-semibold text-gray-700">
            <Image src="/icon.svg" alt="Logo" width={40} height={32} />
            <div className="flex flex-col">
              <p className="text-sm uppercase">{t("site.name")}</p>
              <p className="text-xs">{t("site.slogan")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href={X_URL} target="_blank" rel="noopener noreferrer">
              X (Twitter)
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 sm:gap-8 md:gap-12">
          <div className="flex min-w-44 flex-col gap-2 sm:min-w-fit">
            <h4 className="text-lg font-semibold">{t("footer.links")}</h4>
            <Link className="text-sm text-black" href="/faq" title={t("footer.faq")}>
              {t("footer.faq")}
            </Link>
            <Link className="text-sm text-black" href="/privacy-policy" title={t("footer.privacy_policy")}>
              {t("footer.privacy_policy")}
            </Link>
            <Link className="text-sm text-black" href="/terms" title={t("footer.terms")}>
              {t("footer.terms")}
            </Link>
            <Link className="text-sm text-black" href="/donate" title={t("footer.donate")}>
              {t("footer.donate")}
            </Link>
            <Link className="text-sm text-black" href="mailto:info@e-syrians.com" title={t("footer.contact")}>
              {t("footer.contact")}
            </Link>
          </div>
          <div className="flex min-w-44 flex-col gap-2 sm:min-w-fit">
            <h4 className="text-lg font-semibold">{t("footer.initiatives")}</h4>
            {INITIATIVES.map((initiative, index) => (
              <Link key={index} className="text-sm text-black" href={initiative.link} title={initiative.title}>
                {initiative.title}
              </Link>
            ))}
          </div>
        </div>
      </Container>
      <Container>
        <div className="my-8 h-px bg-gray-200" />
      </Container>
      <Container className="flex items-start justify-between text-sm md:items-center">
        <p>&copy; {t("footer.copy_right")}</p>
        <a href="https://fj.studio" title="BY FJ SOFTWARE STUDIO" target="_blank" rel="noopener noreferrer">
          BY FJ SOFTWARE STUDIO
        </a>
      </Container>
    </footer>
  );
};

export default Footer;
