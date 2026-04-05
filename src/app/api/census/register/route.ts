import { proxyFormDataPost } from "@/lib/api-route";

export const POST = proxyFormDataPost({
  endpoint: "/users/register",
  requireAuth: false,
});
