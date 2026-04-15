// The Google loader drops a stub on `window.grecaptcha` before the real API is
// ready. The stub exposes `ready()` (which queues callbacks) but not a
// functional `execute()`. Both forms count as "truthy", so a naive presence
// check can let a submission proceed while the script is still initialising
// and return an empty or invalid token — which the backend then rejects with
// `invalid_recaptcha_token`. We poll briefly until both functions exist before
// calling `execute`.
const RECAPTCHA_WAIT_TIMEOUT_MS = 10_000;
const RECAPTCHA_POLL_INTERVAL_MS = 100;

const waitForRecaptcha = (timeoutMs: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const g = typeof window !== "undefined" ? window.grecaptcha : undefined;
      if (g && typeof g.ready === "function" && typeof g.execute === "function") {
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

export const generateToken = async (action: string): Promise<string> => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA;
  if (!siteKey) {
    throw new Error("reCAPTCHA site key not configured");
  }

  await waitForRecaptcha(RECAPTCHA_WAIT_TIMEOUT_MS);

  const token = await new Promise<string>((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });

  if (!token) {
    throw new Error("reCAPTCHA returned an empty token");
  }
  return token;
};

const recaptchaIsValid = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping validation");
    return false;
  }
  if (!token) {
    return false;
  }
  try {
    const body = new URLSearchParams({ secret, response: token });
    const captchaVerification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const result = await captchaVerification.json();
    return result.success === true;
  } catch {
    console.warn("reCAPTCHA verification request failed");
    return false;
  }
};

export default recaptchaIsValid;
