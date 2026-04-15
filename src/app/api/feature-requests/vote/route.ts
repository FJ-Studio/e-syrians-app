<<<<<<< HEAD
import { proxyJsonPost } from "@/lib/api-route";
=======
import { withApiRoute } from "@/lib/api-route";
import { NextResponse } from "next/server";
>>>>>>> 45a20e4 (feat: create feature requests by verified users (#82))

/**
 * Vote on a feature request. The Laravel side treats the call as a toggle:
 * same direction → remove, opposite direction → switch, none → add.
 *
 * Body: `{ feature_request_id, vote: "up" | "down", recaptcha_token }`
 * Response (success): `{ data: { outcome: "added" | "removed" | "switched" } }`
<<<<<<< HEAD
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
=======
 *
 * We also handle DELETE /api/feature-requests/vote?id=123 for explicit
 * "clear my vote" calls from the UI (currently unused, but kept for symmetry
 * with the backend's unvote endpoint).
 */
export const POST = withApiRoute(
  async ({ body, session }) => {
    const request = await fetch(`${process.env.API_URL}/feature-requests/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session!.user.accessToken}`,
      },
      body: JSON.stringify({
        feature_request_id: body.feature_request_id,
        vote: body.vote,
      }),
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  },
  { requireAuth: true, requireRecaptcha: true, errorMessage: "feature_request_vote_failed" },
);
>>>>>>> 45a20e4 (feat: create feature requests by verified users (#82))
