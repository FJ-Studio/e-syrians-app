import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/change-email",
  errorMessage: "Failed to change email",
});
