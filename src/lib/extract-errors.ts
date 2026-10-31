type ErrorResponse = Array<string> | Record<string, Array<string>>;

/**
 * Normalize the two shapes the API envelope can carry in its `messages`
 * field into a flat string[]. Called from every toast.error site.
 *
 * Defensive against null/undefined input — the previous implementation
 * threw `Cannot convert undefined or null to object` inside
 * `Object.values(error)` when the backend returned a body without a
 * `messages` field (404 on an unrouted endpoint, 500 from an unhandled
 * throwable, network layer wrapping the response differently, etc.).
 * A crash inside a toast.error call swallows the actual failure and
 * shows a blank error boundary. Returning an empty array here lets the
 * caller fall back to a generic i18n string instead.
 */
const extractErrors = (error: ErrorResponse | null | undefined): Array<string> => {
  if (!error) return [];
  if (Array.isArray(error)) {
    return error;
  }
  if (typeof error !== "object") return [];
  return Object.values(error).flat();
};

export default extractErrors;
