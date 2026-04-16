import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/2fa/disable",
  errorMessage: "Failed to disable 2FA",
});
