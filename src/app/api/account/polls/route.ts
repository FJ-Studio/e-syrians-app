import { proxyFormDataPost, proxyGet } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/my-polls",
  forwardParams: ["page"],
});

export const POST = proxyFormDataPost({
  endpoint: "/polls",
});
