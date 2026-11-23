import { Link as LocalizedLink } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FC } from "react";
import useInitiatives from "../hooks/localization/initiatives";
import Container from "./container";
import FooterConnect from "./footer-connect";
import StatusBadge from "./status-badge";
import ThemeSwitcher from "./theme-switcher";
import ThemedLogo from "./themed-logo";

const Footer: FC = () => {
  const t = useTranslations();
  const initiatives = useInitiatives();
  const groups = [
    {
      key: "explore",
      title: t("footer.explore"),
      links: initiatives.map((initiative) => ({
        href: initiative.link,
        label: initiative.link === "/feature-requests" ? t("header.nav.features") : initiative.title,
      })),
    },
    {
      key: "support",
      title: t("footer.support"),
      links: [
        { href: "/faq", label: t("footer.faq") },
        { href: "mailto:info@e-syrians.com", label: t("footer.contact") },
        { href: "/donate", label: t("footer.donate") },
      ],
    },
    {
      key: "privacy",
      title: t("footer.privacy_safety"),
      links: [
        { href: "/privacy-policy", label: t("footer.privacy_policy") },
        { href: "/terms", label: t("footer.terms") },
        { href: "/child-safety", label: t("footer.child_safety") },
        { href: "/delete-account", label: t("footer.delete_account") },
      ],
    },
  ];
  const linkClassName =
    "text-default-700 hover:text-primary rounded-sm text-sm leading-6 underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

  return (
    <footer className="bg-default-100 text-foreground py-8">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <div className="text-default-700 flex items-center gap-3 font-semibold">
            <ThemedLogo width={40} height={32} />
            <div className="flex flex-col">
              <p className="text-sm uppercase">{t("site.name")}</p>
              <p className="text-xs">{t("site.slogan")}</p>
            </div>
          </div>
          <FooterConnect />
          <StatusBadge />
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-3 lg:justify-items-end lg:gap-x-8">
          {groups.map((group) => (
            <nav
              key={group.key}
              aria-labelledby={`footer-${group.key}`}
              className={group.key === "privacy" ? "col-span-2 min-w-0 sm:col-span-1" : "min-w-0"}
            >
              <h2 id={`footer-${group.key}`} className="text-base font-semibold">
                {group.title}
              </h2>
              <ul
                className={`mt-3 grid gap-y-2 ${group.key === "privacy" ? "grid-cols-2 gap-x-6 sm:grid-cols-1" : ""}`}
              >
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className={linkClassName}>
                        {link.label}
                      </a>
                    ) : (
                      <LocalizedLink href={link.href} className={linkClassName}>
                        {link.label}
                      </LocalizedLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>
      <Container className="mt-8">
        <div className="border-default-200 flex flex-col items-start justify-between gap-4 border-t pt-5 text-sm sm:flex-row sm:items-center">
          <p>&copy; {t("footer.copy_right")}</p>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <a href="https://fj.studio" title="BY FJ SOFTWARE STUDIO" target="_blank" rel="noopener noreferrer">
              BY FJ SOFTWARE STUDIO
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
