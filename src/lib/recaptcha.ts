export const generateToken = async (action: string): Promise<string> => {
  const token = await new Promise<string>((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA as string, {
          action,
        })
        .then(resolve)
        .catch(reject);
    });
  });
  return token;
};
const recaptchaIsValid = async (token: string): Promise<boolean> => {
  const captchaVerification = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body: `secret=${
        process.env.RECAPTCHA_SECRET_KEY as string
      }&response=${token}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const result = await captchaVerification.json();
  return result.success;
};

export default recaptchaIsValid;
