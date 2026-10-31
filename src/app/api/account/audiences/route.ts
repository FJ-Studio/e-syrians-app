import { proxyGet, proxyJsonPost } from "@/lib/api-route";

/**
 * GET /api/account/audiences — lists the signed-in user's audiences.
 * Backend clamps `per_page` to [1, 100]; we forward it through.
 */
export const GET = proxyGet({
  endpoint: "/users/audiences",
  forwardParams: ["page", "per_page"],
});

/**
 * POST /api/account/audiences — create a new audience with optional
 * initial entries. Backend enforces recaptcha + throttling.
 */
export const POST = proxyJsonPost({
  endpoint: "/users/audiences",
});
