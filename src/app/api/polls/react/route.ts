import { proxyGet, proxyJsonPost } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/my-reactions",
  forwardParams: ["page"],
});

export const POST = proxyJsonPost({
  endpoint: "/polls/react",
});
