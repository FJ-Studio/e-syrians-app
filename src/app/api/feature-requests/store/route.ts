import { proxyJsonPost } from "@/lib/api-route";

/**
<<<<<<< HEAD
 * Submit a new feature request. Only `title` + `description` (plus the
 * `recaptcha_token` required by Laravel's `recaptcha` middleware) are
 * forwarded to the backend.
=======
 * Submit a new feature request. Only `title` + `description` are sent to
 * Laravel; recaptcha is verified in the proxy wrapper and stripped before
 * forwarding.
>>>>>>> 45a20e4 (feat: create feature requests by verified users (#82))
 */
export const POST = proxyJsonPost({
  endpoint: "/feature-requests",
  transformBody: (body) => ({
    title: body.title,
    description: body.description,
<<<<<<< HEAD
    recaptcha_token: body.recaptcha_token,
=======
>>>>>>> 45a20e4 (feat: create feature requests by verified users (#82))
  }),
  errorMessage: "feature_request_store_failed",
});
