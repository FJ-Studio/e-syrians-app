import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/change-password",
  errorMessage: "Failed to change password",
  transformBody: (body) => ({
    current_password: body.currentPassword,
    new_password: body.newPassword,
    new_password_confirmation: body.confirmPassword,
    recaptcha_token: body.recaptcha_token,
  }),
});
