"use client";
import { ESUser } from "@/lib/types/account";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type Props = {
  user: ESUser;
};
const UserCardLinksDropdown: FC<Props> = ({ user }) => {
  const t = useTranslations("socialLinks");
  const links = [
    {
      title: t("facebook"),
      link: user.facebook_link,
    },
    {
      title: t("twitter"),
      link: user.twitter_link,
    },
    {
      title: t("instagram"),
      link: user.instagram_link,
    },
    {
      title: t("linkedin"),
      link: user.linkedin_link,
    },
    {
      title: t("youtube"),
      link: user.youtube_link,
    },
    {
      title: t("tiktok"),
      link: user.tiktok_link,
    },
    {
      title: t("twitch"),
      link: user.twitch_link,
    },
    {
      title: t("snapchat"),
      link: user.snapchat_link,
    },
    {
      title: t("pinterest"),
      link: user.pinterest_link,
    },
    {
      title: t("github"),
      link: user.github_link,
    },
    {
      title: t("website"),
      link: user.website,
    },
  ].filter(({ link }) => !!link);

  if (links.length === 0) {
    return <div className="min-w-8"></div>;
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm">
          <EllipsisVerticalIcon className="size-6" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {links.map((link) => (
          <DropdownItem
            key={link.title}
            onPress={() => {
              window.open(link.link, "_blank");
            }}
          >
            {link.title}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserCardLinksDropdown;
