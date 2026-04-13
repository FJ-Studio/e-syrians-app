import { proxyGet } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/2fa/status",
  errorMessage: "Failed to get 2FA status",
});
