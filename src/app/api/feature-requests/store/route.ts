import { proxyJsonPost } from "@/lib/api-route";

/**
 * Submit a new feature request. Only `title` + `description` (plus the
 * `recaptcha_token` required by Laravel's `recaptcha` middleware) are
 * forwarded to the backend.
 */
export const POST = proxyJsonPost({
  endpoint: "/feature-requests",
  transformBody: (body) => ({
    title: body.title,
    description: body.description,
    recaptcha_token: body.recaptcha_token,
  }),
  errorMessage: "feature_request_store_failed",
});
