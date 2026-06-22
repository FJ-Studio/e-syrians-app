import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateToken } from "./recaptcha";

describe("generateToken", () => {
  const hasWindow = "window" in globalThis;
  const originalWindow = (globalThis as { window?: Window }).window;
  const originalSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA;

  // The Enterprise namespace is what `recaptcha.ts` polls on; tests
  // mock `window.grecaptcha.enterprise.{ready, execute}` exactly the
  // way the live SDK would expose them after loading `enterprise.js`.
  type GrecaptchaEnterprise = Window["grecaptcha"]["enterprise"];

  const setMockWindow = (enterprise: GrecaptchaEnterprise) => {
    (globalThis as { window: Window }).window = {
      grecaptcha: { enterprise },
    } as unknown as Window;
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
      execute: undefined as unknown as GrecaptchaEnterprise["execute"],
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
      execute: undefined as unknown as GrecaptchaEnterprise["execute"],
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
  });
});
