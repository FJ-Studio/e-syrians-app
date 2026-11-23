import userIcon from "@iconify-icons/heroicons/user";
import type { AbstractIntlMessages } from "next-intl";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import ku from "../../../messages/ku.json";

const h = vi.hoisted(() => ({
  status: "unauthenticated" as "unauthenticated" | "authenticated" | "loading",
  avatar: undefined as string | undefined,
  locale: "en" as "en" | "ar" | "ku",
  pathname: "/polls",
  isOpen: false,
  signOut: vi.fn(),
  effects: [] as (() => void | (() => void))[],
}));

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: () => [
    h.isOpen,
    (value: boolean) => {
      h.isOpen = value;
    },
  ],
  useEffect: (setup: () => void | (() => void)) => {
    h.effects.push(setup);
  },
}));
vi.mock("@heroui/react", () =>
  Object.fromEntries(
    ["Avatar", "Button", "Dropdown", "DropdownItem", "DropdownMenu", "DropdownSection", "DropdownTrigger"].map(
      (name) => [name, name],
    ),
  ),
);
vi.mock("@/i18n/routing", () => ({ Link: "LocalizedLink", usePathname: () => h.pathname }));
vi.mock("next/link", () => ({ default: "NextLink" }));
vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: h.status, data: { user: { avatar: h.avatar } } }),
  signOut: h.signOut,
}));
vi.mock("next-intl", async (original) => {
  const actual = await original<typeof import("next-intl")>();
  return {
    ...actual,
    useTranslations: (namespace?: string) => {
      const messages: AbstractIntlMessages = { en, ar, ku }[h.locale];
      return actual.createTranslator({
        locale: h.locale,
        messages,
        namespace,
      });
    },
  };
});

import { ACCOUNT_NAV_ITEMS, isAccountNavigationActive } from "./account-navigation";
import HeaderActions from "./header-actions";
import LanguageSwitcher from "./language-switcher";
import Nav from "./nav";

type Tree = ReactElement<Record<string, unknown>>;
function all(node: unknown, type: string, result: Tree[] = []): Tree[] {
  if (Array.isArray(node)) node.forEach((child) => all(child, type, result));
  else if (node && typeof node === "object" && "props" in node) {
    const tree = node as Tree;
    if ((tree.type as unknown) === type) result.push(tree);
    all(tree.props.children, type, result);
  }
  return result;
}
const renderActions = () => HeaderActions({});
const renderNav = () => Nav({});

beforeEach(() => {
  h.status = "unauthenticated";
  h.avatar = undefined;
  h.locale = "en";
  h.pathname = "/polls";
  h.isOpen = false;
  h.effects = [];
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("header account menu", () => {
  it.each(["en", "ar", "ku"] as const)("uses the person icon and locale-aware sign-in for guests (%s)", (locale) => {
    h.locale = locale;
    const tree = renderActions();
    const button = all(tree, "Button")[0];
    expect(button.props.as).toBe("LocalizedLink");
    expect(button.props.href).toBe("/auth/sign-in");
    expect(button.props["aria-label"]).toBe({ en, ar, ku }[locale].common.login);
    expect(all(tree, "Dropdown")).toHaveLength(0);
    expect(button.props.children).toMatchObject({ props: { icon: userIcon } });
  });

  it("does not flash the guest link while session state is loading", () => {
    h.status = "loading";
    const button = all(renderActions(), "Button")[0];
    expect(button.props.isDisabled).toBe(true);
    expect(button.props["aria-busy"]).toBe("true");
    expect(button.props.href).toBeUndefined();
  });

  it.each(["en", "ar", "ku"] as const)("shows the signed-in user's small avatar in %s", (locale) => {
    h.status = "authenticated";
    h.locale = locale;
    h.avatar = "https://example.test/avatar.jpg";
    const tree = renderActions();
    const avatar = all(tree, "Avatar")[0];
    expect(avatar.props.src).toBe(h.avatar);
    expect(avatar.props.className).toBe("size-6 shrink-0");
    expect(avatar.props["aria-hidden"]).toBe("true");
    expect(avatar.props.showFallback).toBe(true);
    expect(avatar.props.fallback).toMatchObject({ props: { icon: userIcon } });
    expect(all(tree, "Button")[0].props["aria-label"]).toBe({ en, ar, ku }[locale].common.account);
  });

  it.each([undefined, "", "   "])("keeps the person icon when the signed-in user has no avatar (%s)", (avatar) => {
    h.status = "authenticated";
    h.avatar = avatar;
    const tree = renderActions();
    expect(all(tree, "Avatar")).toHaveLength(0);
    expect((all(tree, "Button")[0].props.children as Tree[])[0]).toMatchObject({ props: { icon: userIcon } });
  });

  it.each(["unauthenticated", "loading"] as const)("never shows a stale avatar while %s", (status) => {
    h.status = status;
    h.avatar = "https://example.test/previous-user.jpg";
    expect(all(renderActions(), "Avatar")).toHaveLength(0);
  });

  it.each(["en", "ar", "ku"] as const)("includes every dashboard destination and sign out in %s", (locale) => {
    h.status = "authenticated";
    h.locale = locale;
    h.pathname = "/account/settings/notifications";
    const tree = renderActions();
    const items = all(tree, "DropdownItem");
    expect(items.map((item) => item.props.href)).toEqual([
      "/account",
      "/account/polls",
      "/account/audiences",
      "/account/settings",
      "/account/notifications",
      "/account/verifications",
      undefined,
    ]);
    expect(items.map((item) => item.props.children)).toEqual([
      ...ACCOUNT_NAV_ITEMS.map((item) => ({ en, ar, ku })[locale].account.dashboard.nav[item.key]),
      { en, ar, ku }[locale].account.dashboard.nav.signout,
    ]);
    expect(items.filter((item) => item.props.href).every((item) => item.props.as === "LocalizedLink")).toBe(true);
    expect(items.filter((item) => item.props["aria-current"] === "page").map((item) => item.key)).toEqual(["settings"]);
  });

  it("uses the existing NextAuth sign-out action only for sign out", () => {
    h.status = "authenticated";
    const menu = all(renderActions(), "DropdownMenu")[0];
    const onAction = menu.props.onAction as (key: string) => void;
    onAction("overview");
    expect(h.signOut).not.toHaveBeenCalled();
    onAction("signout");
    expect(h.signOut).toHaveBeenCalledExactlyOnceWith();
  });
});

describe("responsive public navigation", () => {
  it.each(["en", "ar", "ku"] as const)(
    "offers the same three links on desktop and in the mobile menu (%s)",
    (locale) => {
      h.locale = locale;
      h.pathname = "/feature-requests/123";
      const tree = renderNav();
      const desktop = all(tree, "LocalizedLink");
      const mobile = all(tree, "DropdownItem");
      expect(desktop.map((item) => item.props.href)).toEqual(["/census", "/polls", "/feature-requests"]);
      expect(mobile.map((item) => item.props.href)).toEqual(desktop.map((item) => item.props.href));
      expect(mobile.map((item) => item.props.children)).toEqual(desktop.map((item) => item.props.children));
      expect(mobile[2].props["aria-current"]).toBe("page");
      expect(mobile[1].props["aria-current"]).toBeUndefined();
      expect(all(tree, "div").map((item) => item.props.className)).toEqual([
        "hidden items-center gap-1 lg:flex",
        "lg:hidden",
      ]);
    },
  );

  it("updates the menu label and closes after selecting a destination", () => {
    h.isOpen = true;
    const tree = renderNav();
    expect(all(tree, "Button")[0].props["aria-label"]).toBe(en.header.nav.closeMenu);
    const menu = all(tree, "DropdownMenu")[0];
    (menu.props.onAction as () => void)();
    expect(h.isOpen).toBe(false);
    expect(all(renderNav(), "Button")[0].props["aria-label"]).toBe(en.header.nav.openMenu);
  });

  it("closes the mobile overlay when resizing to desktop and removes its listener", () => {
    h.isOpen = true;
    const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    const matchMedia = vi.fn(() => media);
    vi.stubGlobal("window", { matchMedia });
    renderNav();
    const cleanup = h.effects[0]();
    expect(matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
    const listener = media.addEventListener.mock.calls[0][1];
    listener({ matches: false });
    expect(h.isOpen).toBe(true);
    listener({ matches: true });
    expect(h.isOpen).toBe(false);
    if (cleanup) cleanup();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", listener);
  });
});

describe("account active routes", () => {
  it.each(["", "/en", "/ar", "/ku"])(
    "handles locale prefix %s without marking overview on every account page",
    (prefix) => {
      expect(isAccountNavigationActive(`${prefix}/account/`, "/account")).toBe(true);
      expect(isAccountNavigationActive(`${prefix}/account/identity-verification`, "/account")).toBe(true);
      expect(isAccountNavigationActive(`${prefix}/account/identity-sandbox`, "/account")).toBe(true);
      expect(isAccountNavigationActive(`${prefix}/account/polls/123`, "/account/polls")).toBe(true);
      expect(isAccountNavigationActive(`${prefix}/account/settings`, "/account")).toBe(false);
      expect(isAccountNavigationActive(`${prefix}/account/polls-other`, "/account/polls")).toBe(false);
      expect(isAccountNavigationActive(`${prefix}/account`, undefined)).toBe(false);
    },
  );
});

describe("header language menu", () => {
  it.each(["/", "/polls", "/account/settings"])(
    "keeps the current destination without doubled slashes: %s",
    (pathname) => {
      h.pathname = pathname;
      const tree = LanguageSwitcher({});
      expect(all(tree, "Button")[0].props["aria-label"]).toBe(en.header.language);
      expect(all(tree, "DropdownItem").map((item) => item.props.href)).toEqual(
        ["ar", "en", "ku"].map((locale) => `/${locale}${pathname === "/" ? "" : pathname}`),
      );
    },
  );
});
