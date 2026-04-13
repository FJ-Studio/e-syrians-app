import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/2fa/setup",
  requireRecaptcha: false,
  errorMessage: "Failed to set up 2FA",
});
