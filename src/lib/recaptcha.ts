// The Google loader drops a stub on `window.grecaptcha.enterprise` before
// the real API is ready. The stub exposes `ready()` (which queues
// callbacks) but not a functional `execute()`. Both forms count as
// "truthy", so a naive presence check can let a submission proceed
// while the script is still initialising and return an empty or
// invalid token — which the backend then rejects with
// `recaptcha_verification_failed`. We poll briefly until both functions
// exist before calling `execute`.
const RECAPTCHA_WAIT_TIMEOUT_MS = 10_000;
const RECAPTCHA_POLL_INTERVAL_MS = 100;

// Type declaration for `window.grecaptcha.enterprise` lives in
// `src/lib/types/global.d.ts`. The classic v3 namespace is
// intentionally NOT declared there — we use the Enterprise SDK
// exclusively (loaded as `enterprise.js` in `app/[locale]/layout.tsx`).

const waitForRecaptcha = (timeoutMs: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const ent = typeof window !== "undefined" ? window.grecaptcha?.enterprise : undefined;
      if (ent && typeof ent.ready === "function" && typeof ent.execute === "function") {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new Error("reCAPTCHA failed to load"));
        return;
      }
      setTimeout(check, RECAPTCHA_POLL_INTERVAL_MS);
    };
    check();
  });
};

/**
 * Client-side helper. Generates a reCAPTCHA Enterprise token for the
 * given `action`. Token verification happens server-side in the
 * Laravel `recaptcha` middleware, which calls Google's Assessments API
 * — we never call `siteverify` from Next.js, and no secret key is
 * exposed to this runtime.
 *
 * `NEXT_PUBLIC_RECAPTCHA` must be an Enterprise site key (the same
 * value the mobile client uses via `EXPO_PUBLIC_RECAPTCHA_SITE_KEY`).
 * Sending a classic-v3 token would fail with `BROWSER_ERROR` because
 * the Enterprise endpoint can't decode legacy tokens.
 */
export const generateToken = async (action: string): Promise<string> => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA;
  if (!siteKey) {
    throw new Error("reCAPTCHA site key not configured");
  }

  await waitForRecaptcha(RECAPTCHA_WAIT_TIMEOUT_MS);

  const token = await new Promise<string>((resolve, reject) => {
    window.grecaptcha.enterprise.ready(() => {
      window.grecaptcha.enterprise.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });

  if (!token) {
    throw new Error("reCAPTCHA returned an empty token");
  }
  return token;
};
