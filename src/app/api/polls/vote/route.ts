import { proxyGet, proxyJsonPost } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/my-votes",
  forwardParams: ["page"],
});

export const POST = proxyJsonPost({
  endpoint: "/polls/vote",
});
