import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/2fa/setup",
  errorMessage: "Failed to set up 2FA",
});
