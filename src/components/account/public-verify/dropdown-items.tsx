"use client";
import { ESUser } from "@/lib/types/account";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { FC } from "react";

type Props = {
  user: ESUser;
};
const PublicVerifyCardDropdown: FC<Props> = ({ user }) => {
  const links = [
    {
      title: "Facebook",
      link: user.facebook_link,
    },
    {
      title: "Twitter",
      link: user.twitter_link,
    },
    {
      title: "Instagram",
      link: user.instagram_link,
    },
    {
      title: "LinkedIn",
      link: user.linkedin_link,
    },
    {
      title: "YouTube",
      link: user.youtube_link,
    },
    {
      title: "TikTok",
      link: user.tiktok_link,
    },
    {
      title: "Twitch",
      link: user.twitch_link,
    },
    {
      title: "Snapchat",
      link: user.snapchat_link,
    },
    {
      title: "Pinterest",
      link: user.pinterest_link,
    },
    {
      title: "Github",
      link: user.github_link,
    },
    {
      title: "Website",
      link: user.website,
    },
  ].filter((link) => link.link);

  if (links.length === 0) {
    return null;
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
          <DropdownItem key={link.title}>
            <a
              href={link.link}
              target="_blank"
              rel="noreferrer"
              className="flex w-full"
            >
              {link.title}
            </a>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default PublicVerifyCardDropdown;
