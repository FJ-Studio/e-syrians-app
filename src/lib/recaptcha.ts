const recaptchaIsValid = async (token: string): Promise<boolean> => {
    const captchaVerification = await fetch(
		'https://www.google.com/recaptcha/api/siteverify',
		{
			method: 'POST',
			body: `secret=${process.env.RECAPTCHA_SECRET_KEY as string}&response=${
				token
			}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		},
	)
    const result = await captchaVerification.json();
	return result.success;
}

export default recaptchaIsValid;