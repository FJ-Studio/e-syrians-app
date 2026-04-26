import { proxyJsonPost } from "@/lib/api-route";

export const POST = proxyJsonPost({
  endpoint: "/users/update/address",
  forwardHeaders: ["Accept-Language"],
});
