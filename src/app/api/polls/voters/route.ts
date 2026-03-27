import { proxyGet } from "@/lib/api-route";

/**
 * GET /api/polls/voters?poll_option_id=...&page=1
 *
 * Proxies to the backend endpoint that returns paginated voters
 * for a specific poll option.
 */
export const GET = proxyGet({
  endpoint: "/polls/option-voters",
  forwardParams: ["poll_option_id", "page"],
});
