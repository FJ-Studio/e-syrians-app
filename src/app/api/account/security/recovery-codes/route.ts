import { proxyGet } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/recovery-codes",
  errorMessage: "Failed to get recovery codes",
});
