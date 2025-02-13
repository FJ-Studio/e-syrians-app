"use client";
import Container from "@/components/shared/container";
import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { Listbox, ListboxItem } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren } from "react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const t = useTranslations("account.dashboard");
  const session = useSession();
  const links = [
    {
      title: t("nav.settings"),
      link: "/account",
      icon: <Cog6ToothIcon className="size-6" />,
    },
    {
      title: t("nav.polls"),
      link: "/account/polls",
      icon: <ChartBarIcon className="size-6" />,
      onPress: undefined,
    },
    {
      title: t("nav.verifications"),
      link: "/account/verifications",
      icon: <ClipboardDocumentCheckIcon className="size-6" />,
    },
    {
      title: t("nav.donate"),
      link: "/account/donate",
      icon: <CurrencyDollarIcon className="size-6" />,
    },
    {
      title: t("nav.signout"),
      link: undefined,
      icon: <ArrowRightStartOnRectangleIcon className="size-6" />,
      onPress: () => signOut(),
    },
  ];
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">
      <div className="bg-primary h-12 flex items-center">
        <Container className="flex items-center text-white justify-between">
          <span>
            {t("welcome", {
              name: session.data?.user.name,
            })}
          </span>
          <button className="bg-transparent border-0" onClick={() => signOut()}>
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white" />
          </button>
        </Container>
      </div>
      <Container className="mt-4">
        <div className="flex items-start gap-x-4">
          <aside className="hidden md:flex bg-gray-50 w-full md:max-w-40 xl:max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 ">
            <Listbox>
              {links.map((link, index) => (
                <ListboxItem
                  key={index}
                  startContent={link.icon}
                  color={
                    link.link && pathname.endsWith(link.link)
                      ? "primary"
                      : "default"
                  }
                  className={
                    link.link && pathname.endsWith(link.link)
                      ? "text-white bg-primary"
                      : ""
                  }
                  onPress={() => {
                    if (link?.onPress) {
                      link.onPress();
                    }
                  }}
                >
                  {link.link ? (
                    <Link className={`w-full flex`} href={link.link}>
                      <span className="">{link.title}</span>
                    </Link>
                  ) : (
                    <span className="w-full flex">{link.title}</span>
                  )}
                </ListboxItem>
              ))}
            </Listbox>
          </aside>
          <div className="w-full">{children}</div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardLayout;
