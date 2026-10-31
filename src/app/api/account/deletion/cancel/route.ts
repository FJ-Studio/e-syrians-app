import { proxyJsonPost } from "@/lib/api-route";

// POST /api/account/deletion/cancel → POST /users/account/cancel-deletion
export const POST = proxyJsonPost({
  endpoint: "/users/account/cancel-deletion",
  errorMessage: "Failed to cancel account deletion",
  transformBody: (body) => ({
    password: body.password,
    recaptcha_token: body.recaptcha_token,
  }),
});
