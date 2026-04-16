import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/recovery-codes/regenerate",
  errorMessage: "Failed to regenerate recovery codes",
});
