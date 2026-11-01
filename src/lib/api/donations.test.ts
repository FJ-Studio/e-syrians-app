import { afterEach, describe, expect, it, vi } from "vitest";
import { getDonationSettings } from "./donations";

const wallet = { name: "Bitcoin", currency: "BTC", network: null, address: "bc1qtestreceivingaddress" };
const disabled = { crypto_enabled: false, crypto_wallets: [] };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("donation settings", () => {
  it("loads the current global settings without caching them or sending user credentials", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    const settings = { crypto_enabled: true, crypto_wallets: [wallet] };
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: true, data: settings }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await getDonationSettings()).toEqual(settings);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/donations/settings", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: expect.any(AbortSignal),
    });
  });

  it("hides configured addresses when the flag is off", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          success: true,
          data: {
            crypto_enabled: false,
            crypto_wallets: [wallet],
          },
        }),
      ),
    );

    expect(await getDonationSettings()).toEqual(disabled);
  });

  it.each([
    { success: true, data: { crypto_enabled: "false", crypto_wallets: [wallet] } },
    { success: true, data: { crypto_enabled: true } },
    { success: true, data: { crypto_enabled: true, crypto_wallets: [{ ...wallet, address: "" }] } },
    { success: false, data: { crypto_enabled: true, crypto_wallets: [wallet] } },
    {},
  ])("fails closed on malformed settings %#", async (body) => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));

    expect(await getDonationSettings()).toEqual(disabled);
  });

  it.each([404, 429, 500])("keeps the rest of the page working when the API returns %s", async (status) => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status })));

    expect(await getDonationSettings()).toEqual(disabled);
  });

  it("fails closed on network and timeout errors", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    expect(await getDonationSettings()).toEqual(disabled);
  });

  it("does not reuse enabled settings after an admin disables the feature", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ success: true, data: { crypto_enabled: true, crypto_wallets: [wallet] } }),
        )
        .mockResolvedValueOnce(Response.json({ success: true, data: disabled })),
    );

    expect((await getDonationSettings()).crypto_wallets).toEqual([wallet]);
    expect(await getDonationSettings()).toEqual(disabled);
  });

  it("stays disabled when the backend URL is not configured", async () => {
    vi.stubEnv("API_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getDonationSettings()).toEqual(disabled);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
