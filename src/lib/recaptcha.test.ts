import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateToken } from "./recaptcha";

// `window.grecaptcha` is populated by Google's async script loader. Our
// helper polls for the real API (not just the "ready"-queue stub) before
// calling `execute()`. These tests simulate both states.

type GrecaptchaLike = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

describe("generateToken", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_RECAPTCHA = "site-key";
    // jsdom isn't on by default in this project — vitest.config's
    // `environment: "node"` means we need to stub window.
    vi.stubGlobal("window", globalThis as unknown as Window);
    delete (globalThis as { grecaptcha?: GrecaptchaLike }).grecaptcha;
  });

  afterEach(() => {
    delete (globalThis as { grecaptcha?: GrecaptchaLike }).grecaptcha;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("throws when the site key is missing", async () => {
    delete process.env.NEXT_PUBLIC_RECAPTCHA;
    await expect(generateToken("submit")).rejects.toThrow(/site key/i);
  });

  it("waits for the real grecaptcha API to appear, then returns a non-empty token", async () => {
    // Start with no `grecaptcha` — the helper should poll until we install it.
    const pending = generateToken("submit");

    setTimeout(() => {
      (globalThis as { grecaptcha?: GrecaptchaLike }).grecaptcha = {
        ready: (cb) => cb(),
        execute: async (_siteKey, opts) => `tok:${opts.action}`,
      };
    }, 50);

    await expect(pending).resolves.toBe("tok:submit");
  });

  it("rejects when grecaptcha returns an empty token", async () => {
    (globalThis as { grecaptcha?: GrecaptchaLike }).grecaptcha = {
      ready: (cb) => cb(),
      execute: async () => "",
    };

    await expect(generateToken("submit")).rejects.toThrow(/empty token/);
  });
});
