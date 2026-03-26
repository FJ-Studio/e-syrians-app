import { proxyFormDataPost } from "@/lib/api-route";

export const POST = proxyFormDataPost({
  endpoint: "/users/update/avatar",
  forwardHeaders: ["Accept-Language"],
  errorMessage: "Failed to update avatar",
});
