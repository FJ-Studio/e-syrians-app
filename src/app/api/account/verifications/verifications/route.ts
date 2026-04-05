import { proxyGet } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/my-verifications",
  forwardParams: ["page"],
});
