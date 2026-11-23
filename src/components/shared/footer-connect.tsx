"use client";

import { FACEBOOK_URL, GOOGLE_PLAY_URL, INSTAGRAM_URL, X_URL } from "@/lib/constants/misc";
import { Button } from "@heroui/react";
import facebookIcon from "@iconify-icons/simple-icons/facebook";
import googlePlayIcon from "@iconify-icons/simple-icons/googleplay";
import instagramIcon from "@iconify-icons/simple-icons/instagram";
import xIcon from "@iconify-icons/simple-icons/x";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";

const socials = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: instagramIcon },
  { label: "X (Twitter)", href: X_URL, icon: xIcon },
  { label: "Facebook", href: FACEBOOK_URL, icon: facebookIcon },
];

export default function FooterConnect() {
  const t = useTranslations("footer");
  return (
    <>
      <div className="flex max-w-full flex-col items-start gap-2">
        <Button
          as="a"
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="bordered"
          className="border-default-300 bg-background max-w-full"
          startContent={<Icon icon={googlePlayIcon} className="size-5 shrink-0" />}
        >
          {t("apps.google_play")}
        </Button>
        <p className="text-default-600 text-xs leading-5">{t("apps.ios_coming_soon")}</p>
      </div>
      <nav aria-label={t("social_media")} className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {socials.map((social) => (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-default-700 hover:text-primary focus-visible:outline-primary inline-flex items-center gap-2 rounded-sm text-sm leading-6 underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Icon icon={social.icon} className="size-4 shrink-0" />
            {social.label}
          </a>
        ))}
      </nav>
    </>
  );
}
