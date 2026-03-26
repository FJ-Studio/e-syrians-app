"use client";
import Container from "@/components/shared/container";
import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  ScaleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, PropsWithChildren, ReactNode, useCallback, useMemo } from "react";

type NavLink = {
  key: string;
  title: string;
  link?: string;
  icon: ReactNode;
  onPress?: () => void;
};

/** Keys shown as individual tabs in the mobile bottom nav */
const PRIMARY_KEYS = ["settings", "polls", "violations", "verifications"];

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const { push } = useRouter();
  const pathname = usePathname();
  const t = useTranslations("account.dashboard");
  const session = useSession();

  const links: NavLink[] = useMemo(
    () => [
      {
        key: "settings",
        title: t("nav.settings"),
        link: "/account",
        icon: <Cog6ToothIcon className="size-5" />,
      },
      {
        key: "polls",
        title: t("nav.polls"),
        link: "/account/polls",
        icon: <ChartBarIcon className="size-5" />,
      },
      {
        key: "violations",
        title: t("nav.violations"),
        link: "/account/violations",
        icon: <ScaleIcon className="size-5" />,
      },
      {
        key: "verifications",
        title: t("nav.verifications"),
        link: "/account/verifications",
        icon: <ClipboardDocumentCheckIcon className="size-5" />,
      },
      {
        key: "donate",
        title: t("nav.donate"),
        link: "/account/donate",
        icon: <CurrencyDollarIcon className="size-5" />,
      },
      {
        key: "wallet",
        title: t("nav.wallet"),
        link: "/account/wallet",
        icon: <WalletIcon className="size-5" />,
      },
      {
        key: "signout",
        title: t("nav.signout"),
        link: undefined,
        icon: <ArrowRightStartOnRectangleIcon className="size-5" />,
        onPress: () => signOut(),
      },
    ],
    [t]
  );

  const isActive = useCallback(
    (href: string | undefined) => {
      if (!href) return false;
      if (href === "/account") {
        return pathname.endsWith("/account");
      }
      return pathname.includes(href);
    },
    [pathname]
  );

  const primaryItems = useMemo(
    () => links.filter((item) => PRIMARY_KEYS.includes(item.key)),
    [links]
  );

  const moreItems = useMemo(
    () => links.filter((item) => !PRIMARY_KEYS.includes(item.key)),
    [links]
  );

  const isMoreActive = useMemo(
    () => moreItems.some((item) => isActive(item.link)),
    [moreItems, isActive]
  );

  return (
    <div className="flex min-h-dvh flex-col relative pt-20">
      {/* Welcome bar — desktop only */}
      <div className="hidden xl:flex bg-primary h-12 items-center">
        <Container className="flex items-center text-white justify-between">
          <span>
            {t("welcome", {
              name: session.data?.user.name ?? "",
            })}
          </span>
          <button
            className="bg-transparent border-0 cursor-pointer"
            onClick={() => signOut()}
          >
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white rtl:rotate-180" />
          </button>
        </Container>
      </div>

      <Container className="mt-4 mb-6">
        <div className="flex items-start gap-x-4">
          {/* Desktop sidebar — visible at xl and above */}
          <aside className="sticky top-32 hidden xl:flex bg-gray-50 w-full xl:max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
            <Listbox aria-label="Account navigation">
              {links.map((link) => (
                <ListboxItem
                  key={link.key}
                  startContent={link.icon}
                  color={
                    link.link && isActive(link.link) ? "primary" : "default"
                  }
                  className={
                    link.link && isActive(link.link)
                      ? "text-white bg-primary"
                      : ""
                  }
                  onPress={() => {
                    if (link?.onPress) {
                      link.onPress();
                    } else if (link.link) {
                      push(link.link);
                    }
                  }}
                >
                  {link.link ? (
                    <Link className="w-full flex" href={link.link}>
                      <span>{link.title}</span>
                    </Link>
                  ) : (
                    <span className="w-full flex">{link.title}</span>
                  )}
                </ListboxItem>
              ))}
            </Listbox>
          </aside>

          {/* Main content — add bottom padding on mobile so content isn't behind bottom nav */}
          <div className="w-full pb-16 xl:pb-0">{children}</div>
        </div>
      </Container>

      {/* Mobile bottom tab bar — visible below xl */}
      <nav className="xl:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-black border-t border-default-200 safe-area-bottom">
        <div className="flex items-center justify-around">
          {primaryItems.map((link) => {
            const active = link.link ? isActive(link.link) : false;
            return (
              <Link
                key={link.key}
                href={link.link!}
                className={`flex-1 flex justify-center py-2 transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-default-500"
                }`}
              >
                <span className="flex flex-col items-center gap-0.5">
                  {link.icon}
                  <span className="text-[10px] leading-tight">
                    {link.title}
                  </span>
                </span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <button
                className={`flex-1 flex justify-center py-2 bg-transparent border-0 cursor-pointer transition-colors ${
                  isMoreActive
                    ? "text-primary font-semibold"
                    : "text-default-500"
                }`}
              >
                <span className="flex flex-col items-center gap-0.5">
                  <EllipsisHorizontalIcon className="size-5" />
                  <span className="text-[10px] leading-tight">
                    {t("nav.more")}
                  </span>
                </span>
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="More options"
              onAction={(key) => {
                const item = moreItems.find((i) => i.key === key);
                if (item?.onPress) {
                  item.onPress();
                } else if (item?.link) {
                  push(item.link);
                }
              }}
            >
              <DropdownSection showDivider>
                {moreItems
                  .filter((item) => item.key !== "signout")
                  .map((link) => (
                    <DropdownItem
                      key={link.key}
                      startContent={link.icon}
                      className={
                        isActive(link.link)
                          ? "text-primary font-semibold"
                          : ""
                      }
                    >
                      {link.title}
                    </DropdownItem>
                  ))}
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="signout"
                  color="danger"
                  className="text-danger"
                  startContent={
                    <ArrowRightStartOnRectangleIcon className="size-5" />
                  }
                >
                  {t("nav.signout")}
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
