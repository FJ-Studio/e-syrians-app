import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ signIn: vi.fn(), openCensusForm: vi.fn() }));

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock("@/components/shared/contexts/es", () => ({
  useEsyrian: () => ({ openCensusForm: h.openCensusForm }),
}));
vi.mock("@heroui/react", () =>
  Object.fromEntries(["Button", "Checkbox", "Divider", "Input"].map((name) => [name, name])),
);
vi.mock("@iconify/react", () => ({ Icon: "Icon" }));
vi.mock("next-auth/react", () => ({ signIn: h.signIn }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("react-hook-form", () => ({
  Controller: "Controller",
  useForm: () => ({ handleSubmit: (submit: unknown) => submit, control: {}, formState: { isSubmitting: false } }),
}));
vi.mock("./apple-signin-button", () => ({ default: "AppleSignInButton" }));
vi.mock("./two-factor-verify", () => ({ default: "TwoFactorVerify" }));

import LoginForm from "./login-form";

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
function googleButton() {
  return all(LoginForm(), "Button").find((node) => node.props.children === "common.continueWithGoogle")!;
}

beforeEach(() => vi.resetAllMocks());

describe("Google account selection", () => {
  it("requests Google's account chooser through authorization params and preserves the account redirect", async () => {
    await (googleButton().props.onPress as () => Promise<void>)();

    expect(h.signIn).toHaveBeenCalledExactlyOnceWith(
      "google",
      { redirect: true, redirectTo: "/account" },
      { prompt: "select_account" },
    );
  });

  it("requests the chooser on every interactive sign-in, including after logout", async () => {
    await (googleButton().props.onPress as () => Promise<void>)();
    await (googleButton().props.onPress as () => Promise<void>)();

    expect(h.signIn).toHaveBeenCalledTimes(2);
    for (const call of h.signIn.mock.calls) expect(call[2]).toEqual({ prompt: "select_account" });
  });

  it("does not add Google authorization parameters to password login", async () => {
    h.signIn.mockResolvedValueOnce({ error: "CredentialsSignin" });
    const data = { email: "existing@example.test", password: "fixture-password" };
    const form = all(LoginForm(), "form")[0];

    await (form.props.onSubmit as (values: typeof data) => Promise<void>)(data);

    expect(h.signIn).toHaveBeenNthCalledWith(1, "credentials", { ...data, redirect: false });
    expect(h.signIn).toHaveBeenNthCalledWith(2, "credentials", {
      ...data,
      redirect: true,
      redirectTo: "/account",
    });
    for (const call of h.signIn.mock.calls) expect(call).toHaveLength(2);
  });

  it("leaves the Apple sign-in entry unchanged", () => {
    expect(all(LoginForm(), "AppleSignInButton")[0].props).toEqual({ redirectTo: "/account" });
  });
});
