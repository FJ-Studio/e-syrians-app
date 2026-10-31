"use client";
import Container from "@/components/shared/container";
import { useRouter } from "@/i18n/routing";
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
import listBulletIcon from "@iconify-icons/heroicons/list-bullet";
import { Icon } from "@iconify/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren, ReactNode, useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";

/**
 * SWR fetcher for the deletion-status proxy. Kept module-local so the
 * layout can share it with the deletion-pending screen's own fetcher
 * (same key + same shape → SWR de-duplicates the round-trip).
 */
interface DashboardDeletionStatus {
  deletion_scheduled_for: string | null;
  is_pending: boolean;
}

const DASHBOARD_DELETION_STATUS_KEY = "/api/account/deletion/status";

const fetchDashboardDeletionStatus = async (url: string): Promise<DashboardDeletionStatus> => {
  const request = await fetch(url, { credentials: "same-origin" });
  const response = await request.json();
  return response?.data as DashboardDeletionStatus;
};

/**
 * Segment that indicates the user is already on the deletion-pending
 * screen. We match on the trailing path — the locale prefix is
 * variable (`/en/account/…`, `/ar/account/…`, etc).
 */
const DELETION_PENDING_SUFFIX = "/account/deletion-pending";

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
  const { push, replace } = useRouter();
  const pathname = usePathname();
  const t = useTranslations("account.dashboard");
  const session = useSession();
  const updateSession = session.update;

  // Pending-deletion invariant: any signed-in user whose account is
  // inside the 15-day grace period MUST be on /account/deletion-
  // pending. Two trigger sources:
  //   (a) fresh JWT / session flip (post sign-in on a pending account,
  //       or an `updateSession(...)` from delete-account.tsx after
  //       request-deletion). `session.user.deletion_scheduled_for`.
  //   (b) cross-device / cross-tab drift — the JWT here can be stale
  //       for up to a session refresh. SWR polls the whitelisted
  //       `/api/account/deletion/status` proxy (which stays reachable
  //       even under the API-side `EnsureAccountNotPendingDeletion`
  //       middleware) and revalidates on focus.
  //
  // The `push`/`replace` navigations use next-intl's routing helpers,
  // which auto-prefix the active locale so the redirect stays inside
  // the current locale segment.
  const isOnDeletionPending = pathname.endsWith(DELETION_PENDING_SUFFIX);
  const sessionUser = session.data?.user;
  const { data: deletionStatus } = useSWR<DashboardDeletionStatus>(
    // Only poll while there's an authenticated session — the proxy
    // requires a bearer token and would 401 otherwise.
    sessionUser ? DASHBOARD_DELETION_STATUS_KEY : null,
    fetchDashboardDeletionStatus,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 30_000,
      fallbackData: sessionUser
        ? {
            deletion_scheduled_for: sessionUser.deletion_scheduled_for ?? null,
            is_pending: !!sessionUser.deletion_scheduled_for,
          }
        : undefined,
    },
  );

  // SWR is authoritative once it has resolved — a fresh `is_pending:
  // false` from the API means the account is no longer pending even if
  // the JWT/session still carries a stale `deletion_scheduled_for` (the
  // cross-device cancel case). Only fall back to the session mirror
  // during the first paint before SWR fills.
  const isPendingDeletion = deletionStatus ? deletionStatus.is_pending : !!sessionUser?.deletion_scheduled_for;

  useEffect(() => {
    if (!sessionUser) return;
    if (isPendingDeletion && !isOnDeletionPending) {
      replace("/account/deletion-pending");
    } else if (!isPendingDeletion && isOnDeletionPending) {
      // Symmetric release: user reactivated (deletion-pending screen
      // cleared the timestamps + mutated the SWR cache), or the
      // background revalidate found the deletion is no longer pending
      // (cross-device cancel).
      //
      // Cross-device case: SWR flipped to `is_pending: false` but the
      // JWT still carries the stale `deletion_scheduled_for`. If we
      // just `replace('/account')`, the global middleware guard in
      // `src/middleware.ts` reads that stale JWT field and redirects
      // right back to `/account/deletion-pending`. Clear the mirror
      // on the session before navigating so the middleware sees the
      // fresh state.
      if (sessionUser.deletion_scheduled_for) {
        void updateSession({
          deletion_requested_at: null,
          deletion_scheduled_for: null,
        }).then(() => {
          replace("/account");
        });
      } else {
        replace("/account");
      }
    }
  }, [isPendingDeletion, isOnDeletionPending, replace, sessionUser, updateSession]);

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
        key: "audiences",
        title: t("nav.audiences"),
        link: "/account/audiences",
        icon: <Icon icon={listBulletIcon} className="size-5" />,
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
