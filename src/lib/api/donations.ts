import { DonationSettings } from "@/lib/types/donations";
import { z } from "zod";

const responseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    crypto_enabled: z.boolean(),
    crypto_wallets: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(80),
          currency: z.string().regex(/^[A-Z0-9]{1,20}$/),
          network: z.string().max(60).nullable(),
          address: z.string().regex(/^[A-Za-z0-9:._-]{1,255}$/),
        }),
      )
      .max(20),
  }),
});

/** Never fall back to hardcoded receiving addresses or a cached feature flag. */
export async function getDonationSettings(): Promise<DonationSettings> {
  const disabled: DonationSettings = { crypto_enabled: false, crypto_wallets: [] };
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return disabled;

  try {
    const response = await fetch(`${apiUrl}/donations/settings`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return disabled;

    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.data.crypto_enabled) return disabled;

    return parsed.data.data;
  } catch {
    // An unavailable or older API must not make the donation page fail,
    // nor accidentally enable crypto donations.
    return disabled;
  }
}
