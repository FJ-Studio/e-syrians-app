import { proxyJsonPost } from "@/lib/api-route";

/**
 * Submit a new feature request. Only `title` + `description` are sent to
 * Laravel; recaptcha is verified in the proxy wrapper and stripped before
 * forwarding.
 */
export const POST = proxyJsonPost({
  endpoint: "/feature-requests",
  transformBody: (body) => ({
    title: body.title,
    description: body.description,
  }),
  errorMessage: "feature_request_store_failed",
});
