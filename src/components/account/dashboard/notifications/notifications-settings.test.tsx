import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  cleanups: [] as (() => void)[],
  stateIndex: 0,
  refIndex: 0,
  owner: "owner-A",
  mounted: false,
  data: undefined as Record<string, { in_app: boolean; push: boolean; email?: boolean }> | undefined,
  error: undefined as Error | undefined,
  loading: false,
  mutate: vi.fn(),
  save: vi.fn(),
  success: vi.fn(),
  failure: vi.fn(),
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState(initial: unknown) {
    const i = h.stateIndex++;
    if (!(i in h.states)) h.states[i] = initial;
    return [
      h.states[i],
      (value: unknown) => {
        h.states[i] = value;
      },
    ];
  },
  useRef(initial: unknown) {
    const i = h.refIndex++;
    return h.refs[i] ?? (h.refs[i] = { current: initial });
  },
  useEffect(setup: () => () => void) {
    if (!h.mounted) {
      h.cleanups.push(setup());
      h.mounted = true;
    }
  },
}));
vi.mock("@heroui/react", () =>
  Object.fromEntries(["Button", "Card", "CardBody", "CardHeader", "Spinner", "Switch"].map((name) => [name, name])),
);
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { uuid: h.owner } } }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("sonner", () => ({ toast: { success: h.success, error: h.failure } }));
vi.mock("swr", () => ({
  default: () => ({ data: h.data, error: h.error, isLoading: h.loading, isValidating: false, mutate: h.mutate }),
}));
vi.mock("@/lib/api/notification-preferences", () => ({
  readNotificationPreferences: vi.fn(),
  saveNotificationPreference: h.save,
}));

import { NOTIFICATION_CATEGORIES } from "@/lib/notification-preferences";
import AccountNotification from "../settings/notifications/notifications";
import NotificationsSettings, { NotificationPreferencesForAccount } from "./notifications-settings";

type Tree = ReactElement<Record<string, unknown>>;
const defaults = () =>
  Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((category) => [
      category,
      { in_app: category !== "announcements", push: category !== "announcements" },
    ]),
  );
function all(node: unknown, type: string, result: Tree[] = []): Tree[] {
  if (Array.isArray(node)) node.forEach((child) => all(child, type, result));
  else if (node && typeof node === "object" && "props" in node) {
    const tree = node as Tree;
    if ((tree.type as unknown) === type) result.push(tree);
    all(tree.props.children, type, result);
  }
  return result;
}
function render() {
  h.stateIndex = h.refIndex = 0;
  return NotificationPreferencesForAccount({ userUuid: h.owner });
}
const settled = () => new Promise(setImmediate);
const change = (control: Tree, value: boolean) => (control.props.onValueChange as (value: boolean) => void)(value);
const find = (tree: unknown, category = "security", channel = "push") =>
  all(tree, "Switch").find((node) => node.props["aria-label"] === `categories.${category}.title: channels.${channel}`)!;

beforeEach(() => {
  h.states = [];
  h.refs = [];
  h.cleanups = [];
  h.mounted = false;
  h.owner = "owner-A";
  h.data = defaults();
  h.error = undefined;
  h.loading = false;
  vi.clearAllMocks();
  h.save.mockReset();
  h.mutate.mockImplementation(async (next) => {
    if (next) h.data = next;
    return h.data;
  });
});

describe("notification settings", () => {
  it("reuses one component for both routes and remounts preferences when the account changes", () => {
    expect(AccountNotification).toBe(NotificationsSettings);
    expect(NotificationsSettings().key).toBe("owner-A");
    h.owner = "owner-B";
    expect(NotificationsSettings().key).toBe("owner-B");
  });
  it("exposes all seven categories with independent saved values and no automatic opt-in", () => {
    const tree = render();
    expect(all(tree, "Switch")).toHaveLength(14);
    for (const category of NOTIFICATION_CATEGORIES) {
      for (const channel of ["in_app", "push"])
        expect(find(tree, category, channel).props.isSelected).toBe(category !== "announcements");
    }
    expect(h.save).not.toHaveBeenCalled();
  });
  it("shows and saves email only for the two categories supported by the API", async () => {
    h.data = {
      ...defaults(),
      verifications: { in_app: true, push: true, email: true },
      account_status: { in_app: true, push: true, email: false },
    };
    const next = { ...h.data, verifications: { in_app: true, push: true, email: false } };
    h.save.mockResolvedValue(next);
    const tree = render();
    expect(all(tree, "Switch")).toHaveLength(16);
    expect(find(tree, "security", "email")).toBeUndefined();
    change(find(tree, "verifications", "email"), false);
    await settled();
    expect(h.save).toHaveBeenCalledWith("owner-A", "verifications", "email", false);
    expect(find(render(), "verifications", "email").props.isSelected).toBe(false);
    expect(find(render(), "verifications", "push").props.isSelected).toBe(true);
  });
  it("keeps all channels in one aligned group without duplicating responsive switches", () => {
    h.data = {
      ...defaults(),
      verifications: { in_app: true, push: true, email: false },
      account_status: { in_app: true, push: true, email: true },
    };
    const tree = render();
    const rows = all(tree, "section");
    expect(rows).toHaveLength(NOTIFICATION_CATEGORIES.length);
    expect(all(tree, "Switch")).toHaveLength(16);
    for (const [index, row] of rows.entries()) {
      const category = NOTIFICATION_CATEGORIES[index];
      const controls = (row.props.children as Tree[])[1];
      const cells = controls.props.children as Tree[];
      expect(controls.props.className).toContain("grid-cols-3");
      expect(cells).toHaveLength(3);
      expect(all(cells[0], "Switch")[0]).toBe(find(row, category, "in_app"));
      expect(all(cells[1], "Switch")[0]).toBe(find(row, category, "push"));
      if (["verifications", "account_status"].includes(category)) {
        expect(all(cells[2], "Switch")).toHaveLength(1);
      } else {
        expect(all(cells[2], "Switch")).toHaveLength(0);
        expect(all(cells[2], "span").some((node) => node.props.role === "note")).toBe(true);
      }
    }
  });
  it("uses two columns and omits email guidance when the API does not support email preferences", () => {
    const tree = render();
    for (const row of all(tree, "section")) {
      const controls = (row.props.children as Tree[])[1];
      expect(controls.props.className).toContain("grid-cols-2");
      expect(controls.props.children).toHaveLength(2);
    }
    const [details] = all(tree, "details");
    expect(details.props.open).not.toBe(true);
    expect(all(details, "summary")[0].props.children).toBe("deliveryDetails");
    expect(all(details, "p").map((node) => node.props.children)).toEqual(["pushNote", "platformNote", "explanation"]);
  });
  it("disables every switch while loading or when preferences could not be loaded", () => {
    h.data = undefined;
    h.loading = true;
    expect(all(render(), "Switch").every((node) => node.props.isDisabled)).toBe(true);
    h.loading = false;
    h.error = new Error("offline");
    expect(all(render(), "Switch").every((node) => node.props.isDisabled)).toBe(true);
  });
  it("serializes changes and updates only after a successful account-bound save", async () => {
    let resolve!: (value: unknown) => void;
    h.save.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const tree = render();
    change(find(tree), false);
    change(find(tree, "security", "in_app"), false);
    expect(h.save).toHaveBeenCalledExactlyOnceWith("owner-A", "security", "push", false);
    expect(all(render(), "Switch").every((node) => node.props.isDisabled)).toBe(true);
    const next = defaults();
    next.security.push = false;
    resolve(next);
    await settled();
    const updated = render();
    expect(find(updated).props.isSelected).toBe(false);
    expect(find(updated, "security", "in_app").props.isSelected).toBe(true);
    expect(h.success).toHaveBeenCalledWith("saved");
  });
  it("retains confirmed choices and reports failure without claiming a save succeeded", async () => {
    h.save.mockRejectedValue(new Error("offline"));
    change(find(render()), false);
    await settled();
    expect(find(render()).props.isSelected).toBe(true);
    expect(h.failure).toHaveBeenCalledWith("saveError");
    expect(h.success).not.toHaveBeenCalled();
    expect(h.mutate).toHaveBeenCalledWith();
  });
  it("ignores a pending result when the account-specific screen unmounts", async () => {
    let resolve!: (value: unknown) => void;
    h.save.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    change(find(render()), false);
    h.cleanups.forEach((cleanup) => cleanup());
    resolve(defaults());
    await settled();
    expect(h.mutate).not.toHaveBeenCalled();
    expect(h.success).not.toHaveBeenCalled();
  });
});
