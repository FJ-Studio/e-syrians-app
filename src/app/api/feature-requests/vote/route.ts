import { proxyJsonPost } from "@/lib/api-route";

/**
 * Vote on a feature request. The Laravel side treats the call as a toggle:
 * same direction → remove, opposite direction → switch, none → add.
 *
 * Body: `{ feature_request_id, vote: "up" | "down", recaptcha_token }`
 * Response (success): `{ data: { outcome: "added" | "removed" | "switched" } }`
 */
export const POST = proxyJsonPost({
  endpoint: "/feature-requests/vote",
  transformBody: (body) => ({
    feature_request_id: body.feature_request_id,
    vote: body.vote,
    recaptcha_token: body.recaptcha_token,
  }),
  errorMessage: "feature_request_vote_failed",
});
