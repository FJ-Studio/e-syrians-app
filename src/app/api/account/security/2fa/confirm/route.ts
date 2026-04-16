import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/2fa/confirm",
  errorMessage: "Failed to confirm 2FA",
});
