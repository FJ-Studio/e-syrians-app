import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD

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
=======
import { generateToken } from "./recaptcha";

describe("generateToken", () => {
  const hasWindow = "window" in globalThis;
  const originalWindow = (globalThis as { window?: Window }).window;
  const originalSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA;
  const setMockWindow = (grecaptcha: Window["grecaptcha"]) => {
    (globalThis as { window: Window }).window = { grecaptcha } as unknown as Window;
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_RECAPTCHA = "site-key";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_RECAPTCHA = originalSiteKey;

    if (hasWindow && originalWindow !== undefined) {
      (globalThis as { window: Window }).window = originalWindow;
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("returns the token when recaptcha is fully loaded", async () => {
    const execute = vi.fn().mockResolvedValue("token-123");
    setMockWindow({
      ready: (callback) => callback(),
      execute,
    });

    await expect(generateToken("feature_request_vote")).resolves.toBe("token-123");
    expect(execute).toHaveBeenCalledWith("site-key", { action: "feature_request_vote" });
  });

  it("waits until execute is available before requesting a token", async () => {
    vi.useFakeTimers();

    const execute = vi.fn().mockResolvedValue("token-456");
    setMockWindow({
      ready: (callback) => callback(),
      execute: undefined as unknown as Window["grecaptcha"]["execute"],
    });

    setTimeout(() => {
      setMockWindow({
        ready: (callback) => callback(),
        execute,
      });
    }, 250);

    const tokenPromise = generateToken("feature_request_vote");
    await vi.advanceTimersByTimeAsync(350);

    await expect(tokenPromise).resolves.toBe("token-456");
    expect(execute).toHaveBeenCalledWith("site-key", { action: "feature_request_vote" });
  });

  it("rejects when recaptcha loading times out", async () => {
    vi.useFakeTimers();

    setMockWindow({
      ready: (callback) => callback(),
      execute: undefined as unknown as Window["grecaptcha"]["execute"],
    });

    const tokenPromise = generateToken("feature_request_vote");
    const rejection = expect(tokenPromise).rejects.toThrow("reCAPTCHA failed to load");
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
  });

  it("rejects when recaptcha returns an empty token", async () => {
    setMockWindow({
      ready: (callback) => callback(),
      execute: vi.fn().mockResolvedValue(""),
    });

    await expect(generateToken("feature_request_vote")).rejects.toThrow("reCAPTCHA returned an empty token");
>>>>>>> 45a20e4 (feat: create feature requests by verified users (#82))
  });
});
