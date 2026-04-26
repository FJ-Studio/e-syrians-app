import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/password/set",
  errorMessage: "Failed to set password",
  transformBody: (body) => ({
    otp: body.otp,
    new_password: body.newPassword,
    new_password_confirmation: body.confirmPassword,
    recaptcha_token: body.recaptcha_token,
  }),
});
