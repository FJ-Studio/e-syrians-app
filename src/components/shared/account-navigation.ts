import bellIcon from "@iconify-icons/heroicons/bell";
import chartBarIcon from "@iconify-icons/heroicons/chart-bar";
import clipboardDocumentCheckIcon from "@iconify-icons/heroicons/clipboard-document-check";
import cog6ToothIcon from "@iconify-icons/heroicons/cog-6-tooth";
import homeIcon from "@iconify-icons/heroicons/home";
import listBulletIcon from "@iconify-icons/heroicons/list-bullet";

// Shared by the header menu and dashboard navigation. Sign out stays an action,
// not a destination, so both surfaces use NextAuth's current-session logout.
export const ACCOUNT_NAV_ITEMS = [
  { key: "overview", href: "/account", icon: homeIcon },
  { key: "polls", href: "/account/polls", icon: chartBarIcon },
  { key: "audiences", href: "/account/audiences", icon: listBulletIcon },
  { key: "settings", href: "/account/settings", icon: cog6ToothIcon },
  { key: "notifications", href: "/account/notifications", icon: bellIcon },
  { key: "verifications", href: "/account/verifications", icon: clipboardDocumentCheckIcon },
] as const;

export function isAccountNavigationActive(pathname: string, href: string | undefined): boolean {
  if (!href) return false;
  const path = pathname.replace(/^\/(ar|en|ku)(?=\/|$)/, "").replace(/\/$/, "");
  if (href === "/account") {
    return path === href || /^\/account\/identity-(sandbox|verification)$/.test(path);
  }
  return path === href || path.startsWith(`${href}/`);
}
