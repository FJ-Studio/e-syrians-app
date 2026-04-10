import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/recovery-codes/regenerate",
  requireRecaptcha: false,
  errorMessage: "Failed to regenerate recovery codes",
});
