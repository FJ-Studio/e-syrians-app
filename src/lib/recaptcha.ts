export const generateToken = async (action: string): Promise<string> => {
  if (!window.grecaptcha) {
    throw new Error("reCAPTCHA not loaded");
  }
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA;
  if (!siteKey) {
    throw new Error("reCAPTCHA site key not configured");
  }
  const token = await new Promise<string>((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
  return token;
};

const recaptchaIsValid = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping validation");
    return false;
  }
  try {
    const captchaVerification = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: `secret=${secret}&response=${token}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const result = await captchaVerification.json();
    return result.success;
  } catch {
    console.warn("reCAPTCHA verification request failed");
    return false;
  }
};

export default recaptchaIsValid;
