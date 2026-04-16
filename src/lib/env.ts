/**
 * Runtime-validated environment variables.
 *
 * Server-only vars are validated lazily on first access.
 * Client (NEXT_PUBLIC_) vars are validated at import time.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Client-side (NEXT_PUBLIC_) — available in both server and client bundles
// ---------------------------------------------------------------------------
export const NEXT_PUBLIC_RECAPTCHA = process.env.NEXT_PUBLIC_RECAPTCHA ?? "";
export const NEXT_PUBLIC_DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME ?? "";
export const NEXT_PUBLIC_DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL ?? "";
export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

// ---------------------------------------------------------------------------
// Server-only — lazily validated so client bundles don't crash
// ---------------------------------------------------------------------------
let _apiUrl: string | undefined;
export function getApiUrl(): string {
  if (!_apiUrl) {
    _apiUrl = required("API_URL");
  }
  return _apiUrl;
}

// reCAPTCHA verification now lives on the Laravel side — the secret is kept
// there, not in the Next.js runtime. Only `NEXT_PUBLIC_RECAPTCHA` (site key)
// is needed on the frontend.

let _stripeSecretKey: string | undefined;
export function getStripeSecretKey(): string {
  if (!_stripeSecretKey) {
    _stripeSecretKey = required("STRIPE_SECRET_KEY");
  }
  return _stripeSecretKey;
}
