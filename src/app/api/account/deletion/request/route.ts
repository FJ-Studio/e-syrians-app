import { proxyJsonPost } from "@/lib/api-route";

// POST /api/account/deletion/request → POST /users/account/request-deletion
//
// Password-verified on the backend. reCAPTCHA-gated — we must forward
// `recaptcha_token` unchanged; the transform below is only for clarity
// (the backend accepts { password, recaptcha_token } directly).
export const POST = proxyJsonPost({
  endpoint: "/users/account/request-deletion",
  errorMessage: "Failed to request account deletion",
  transformBody: (body) => ({
    password: body.password,
    recaptcha_token: body.recaptcha_token,
  }),
});
