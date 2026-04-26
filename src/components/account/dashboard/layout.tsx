"use client";
import Container from "@/components/shared/container";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import arrowRightOnRectangleIcon from "@iconify-icons/heroicons/arrow-right-on-rectangle";
import bellIcon from "@iconify-icons/heroicons/bell";
import chartBarIcon from "@iconify-icons/heroicons/chart-bar";
import clipboardDocumentCheckIcon from "@iconify-icons/heroicons/clipboard-document-check";
import cog6ToothIcon from "@iconify-icons/heroicons/cog-6-tooth";
import ellipsisHorizontalIcon from "@iconify-icons/heroicons/ellipsis-horizontal";
import homeIcon from "@iconify-icons/heroicons/home";
import { Icon } from "@iconify/react";
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
const PRIMARY_KEYS = ["overview", "polls", "notifications", "settings"];

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const { push } = useRouter();
  const pathname = usePathname();
  const t = useTranslations("account.dashboard");
  const session = useSession();

  const links: NavLink[] = useMemo(
    () => [
      {
        key: "overview",
        title: t("nav.overview"),
        link: "/account",
        icon: <Icon icon={homeIcon} className="size-5" />,
      },
      {
        key: "polls",
        title: t("nav.polls"),
        link: "/account/polls",
        icon: <Icon icon={chartBarIcon} className="size-5" />,
      },
      {
        key: "settings",
        title: t("nav.settings"),
        link: "/account/settings",
        icon: <Icon icon={cog6ToothIcon} className="size-5" />,
      },
      {
        key: "notifications",
        title: t("nav.notifications"),
        link: "/account/notifications",
        icon: <Icon icon={bellIcon} className="size-5" />,
      },
      {
        key: "verifications",
        title: t("nav.verifications"),
        link: "/account/verifications",
        icon: <Icon icon={clipboardDocumentCheckIcon} className="size-5" />,
      },
      {
        key: "signout",
        title: t("nav.signout"),
        link: undefined,
        icon: <Icon icon={arrowRightOnRectangleIcon} className="size-5" />,
        onPress: () => signOut(),
      },
    ],
    [t],
  );

  const isActive = useCallback(
    (href: string | undefined) => {
      if (!href) return false;
      // Exact match for the overview page
      if (href === "/account") {
        return pathname.endsWith("/account");
      }
      return pathname.includes(href);
    },
    [pathname],
  );

  const primaryItems = useMemo(() => links.filter((item) => PRIMARY_KEYS.includes(item.key)), [links]);

  const moreItems = useMemo(() => links.filter((item) => !PRIMARY_KEYS.includes(item.key)), [links]);

  const isMoreActive = useMemo(() => moreItems.some((item) => isActive(item.link)), [moreItems, isActive]);

  return (
    <div className="relative flex min-h-dvh flex-col pt-20">
      {/* Welcome bar — desktop only */}
      <div className="bg-primary hidden h-12 items-center xl:flex">
        <Container className="text-primary-foreground flex items-center justify-between">
          <span>
            {t("welcome", {
              name: session.data?.user?.name ?? "",
            })}
          </span>
          <button className="cursor-pointer border-0 bg-transparent" onClick={() => signOut()}>
            <Icon icon={arrowRightOnRectangleIcon} className="text-primary-foreground h-6 w-6 rtl:rotate-180" />
          </button>
        </Container>
      </div>

      <Container className="mt-4 mb-6">
        <div className="flex items-start gap-x-4">
          {/* Desktop sidebar — visible at xl and above */}
          <aside className="border-small rounded-small border-default-200 bg-default-50 sticky top-32 hidden w-full px-1 py-2 xl:flex xl:max-w-64">
            <Listbox aria-label="Account navigation">
              {links.map((link) => (
                <ListboxItem
                  key={link.key}
                  startContent={link.icon}
                  color={link.link && isActive(link.link) ? "primary" : "default"}
                  className={link.link && isActive(link.link) ? "bg-primary text-primary-foreground" : ""}
                  onPress={() => {
                    if (link?.onPress) {
                      link.onPress();
                    } else if (link.link) {
                      push(link.link);
                    }
                  }}
                >
                  {link.link ? (
                    <Link className="flex w-full" href={link.link}>
                      <span>{link.title}</span>
                    </Link>
                  ) : (
                    <span className="flex w-full">{link.title}</span>
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
      <nav className="border-default-200 safe-area-bottom bg-background fixed inset-x-0 bottom-0 z-50 border-t xl:hidden">
        <div className="flex items-center justify-around">
          {primaryItems.map((link) => {
            const active = link.link ? isActive(link.link) : false;
            return (
              <Link
                key={link.key}
                href={link.link!}
                className={`flex flex-1 justify-center py-2 transition-colors ${
                  active ? "text-primary font-semibold" : "text-default-500"
                }`}
              >
                <span className="flex flex-col items-center gap-0.5">
                  {link.icon}
                  <span className="text-[10px] leading-tight">{link.title}</span>
                </span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <button
                className={`flex flex-1 cursor-pointer justify-center border-0 bg-transparent py-2 transition-colors ${
                  isMoreActive ? "text-primary font-semibold" : "text-default-500"
                }`}
              >
                <span className="flex flex-col items-center gap-0.5">
                  <Icon icon={ellipsisHorizontalIcon} className="size-5" />
                  <span className="text-[10px] leading-tight">{t("nav.more")}</span>
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
                      className={isActive(link.link) ? "text-primary font-semibold" : ""}
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
                  startContent={<Icon icon={arrowRightOnRectangleIcon} className="size-5" />}
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
