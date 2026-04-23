import { proxyGet, proxyJsonPost } from "@/lib/api-route";

export const GET = proxyGet({
  endpoint: "/users/notifications",
  forwardParams: ["page"],
});

// Mark all as read
export const POST = proxyJsonPost({
  endpoint: "/users/notifications/mark-all-read",
});
