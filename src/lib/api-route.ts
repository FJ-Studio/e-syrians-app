import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
//
// reCAPTCHA verification now lives on the Laravel side: the backend protects
// any route that accepts human-submitted data with its own `recaptcha`
// middleware. The Next.js proxy layer is therefore just a thin forwarder — it
// authenticates the session, passes the body through (including
// `recaptcha_token` when present), and forwards whatever the backend returns.

interface ApiRouteOptions {
  requireAuth?: boolean;
  errorMessage?: string;
}

type RouteHandler = (params: {
  req: NextRequest;
  session: Session | null;
  body: Record<string, unknown>;
}) => Promise<NextResponse>;

type FormDataRouteHandler = (params: {
  req: NextRequest;
  session: Session | null;
  body: FormData;
}) => Promise<NextResponse>;

// ---------------------------------------------------------------------------
// Low-level wrappers (for routes that need custom logic)
// ---------------------------------------------------------------------------

/**
 * Wraps a JSON-body API route with auth and error handling.
 */
export function withApiRoute(handler: RouteHandler, options: ApiRouteOptions = {}) {
  const { requireAuth = true, errorMessage = "An error occurred" } = options;

  return async (req: NextRequest) => {
    try {
      const body = await req.json();

      let session: Session | null = null;
      if (requireAuth) {
        session = await auth();
        if (!session?.user.accessToken) {
          return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
        }
      }

      return await handler({ req, session, body });
    } catch {
      return NextResponse.json({ success: false, messages: [errorMessage] }, { status: 500 });
    }
  };
}

/**
 * Wraps a FormData-body API route with auth and error handling.
 */
export function withFormDataApiRoute(handler: FormDataRouteHandler, options: ApiRouteOptions = {}) {
  const { requireAuth = true, errorMessage = "An error occurred" } = options;

  return async (req: NextRequest) => {
    try {
      let session: Session | null = null;
      if (requireAuth) {
        session = await auth();
        if (!session?.user.accessToken) {
          return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
        }
      }

      const body = await req.formData();

      return await handler({ req, session, body });
    } catch {
      return NextResponse.json({ success: false, messages: [errorMessage] }, { status: 500 });
    }
  };
}

/**
 * Wraps a GET route with auth and error handling.
 */
export function withAuthGet(
  handler: (params: { req: NextRequest; session: Session }) => Promise<NextResponse>,
  errorMessage = "An error occurred",
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user.accessToken) {
        return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
      }
      return await handler({ req, session });
    } catch {
      return NextResponse.json({ success: false, messages: [errorMessage] }, { status: 500 });
    }
  };
}

// ---------------------------------------------------------------------------
// High-level proxy helpers (for routes that just forward to the backend)
// ---------------------------------------------------------------------------

interface ProxyJsonPostOptions {
  /** Backend endpoint path, e.g. "/users/update/address" */
  endpoint: string;
  errorMessage?: string;
  /**
   * Optional transform of the incoming body before sending to backend.
   *
   * IMPORTANT: if the backend endpoint is protected by the `recaptcha`
   * middleware, the transform MUST preserve `recaptcha_token`, otherwise the
   * backend will reject the request with `recaptcha_token_required`.
   */
  transformBody?: (body: Record<string, unknown>) => Record<string, unknown>;
  /** Optional callback after a successful backend response */
  onSuccess?: (
    response: Record<string, unknown>,
    session: Session,
    backendStatus: number,
  ) => Promise<NextResponse | void>;
}

/**
 * Creates a POST route that proxies JSON to the backend.
 * Handles auth, error wrapping, and JSON forwarding in one call.
 *
 * Usage:
 *   export const POST = proxyJsonPost({ endpoint: "/users/update/address" });
 */
export function proxyJsonPost(options: ProxyJsonPostOptions) {
  const { endpoint, errorMessage = "An error occurred", transformBody, onSuccess } = options;

  return withApiRoute(
    async ({ body, session }) => {
      const payload = transformBody ? transformBody(body) : body;
      const request = await fetch(`${process.env.API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session!.user.accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const response = await request.json();

      if (onSuccess && response.success) {
        const customResponse = await onSuccess(response, session!, request.status);
        if (customResponse) return customResponse;
      }

      return NextResponse.json(response, { status: request.status });
    },
    { requireAuth: true, errorMessage },
  );
}

interface ProxyPublicJsonPostOptions {
  /** Backend endpoint path, e.g. "/users/forgot-password" */
  endpoint: string;
  /** Zod-like schema to validate the incoming body (must have a .safeParse method) */
  bodySchema?: {
    safeParse: (data: unknown) => {
      success: boolean;
      error?: { issues: Array<{ message: string }> };
    };
  };
  errorMessage?: string;
}

/**
 * Creates a POST route for public (unauthenticated) endpoints.
 * Handles optional body validation and error wrapping. The backend enforces
 * reCAPTCHA verification for any endpoint that needs it.
 *
 * Usage:
 *   export const POST = proxyPublicJsonPost({ endpoint: "/users/forgot-password", bodySchema: ForgotPasswordSchema });
 */
export function proxyPublicJsonPost(options: ProxyPublicJsonPostOptions) {
  const { endpoint, bodySchema, errorMessage = "An error occurred" } = options;

  return withApiRoute(
    async ({ body }) => {
      if (bodySchema) {
        const result = bodySchema.safeParse(body);
        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              messages: result.error!.issues.map((i) => i.message),
            },
            { status: 400 },
          );
        }
      }

      const request = await fetch(`${process.env.API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const response = await request.json();
      return NextResponse.json(response, { status: request.status });
    },
    { requireAuth: false, errorMessage },
  );
}

interface ProxyFormDataPostOptions {
  /** Backend endpoint path, e.g. "/users/update/avatar" */
  endpoint: string;
  requireAuth?: boolean;
  errorMessage?: string;
  /** Extra headers to forward from the incoming request (e.g. ["Accept-Language"]) */
  forwardHeaders?: string[];
}

/**
 * Creates a POST route that proxies FormData to the backend.
 * Handles auth, error wrapping, and FormData forwarding. The `recaptcha_token`
 * field — if present in the FormData — is forwarded as-is so the backend
 * middleware can verify it.
 *
 * Usage:
 *   export const POST = proxyFormDataPost({ endpoint: "/users/update/avatar", forwardHeaders: ["Accept-Language"] });
 */
export function proxyFormDataPost(options: ProxyFormDataPostOptions) {
  const { endpoint, requireAuth = true, errorMessage = "An error occurred", forwardHeaders = [] } = options;

  return withFormDataApiRoute(
    async ({ req, session, body }) => {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (session?.user.accessToken) {
        headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
      for (const header of forwardHeaders) {
        const value = req.headers.get(header);
        if (value) headers[header] = value;
      }

      const request = await fetch(`${process.env.API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      });
      const response = await request.json();
      return NextResponse.json(response, { status: request.status });
    },
    { requireAuth, errorMessage },
  );
}

interface ProxyGetOptions {
  /** Backend endpoint path, e.g. "/users/my-polls" */
  endpoint: string;
  /** Query params to forward from the incoming request (e.g. ["page"]) */
  forwardParams?: string[];
  errorMessage?: string;
}

/**
 * Creates a GET route that proxies to the backend with auth.
 * Handles auth, error wrapping, and query param forwarding.
 *
 * Usage:
 *   export const GET = proxyGet({ endpoint: "/users/my-polls", forwardParams: ["page"] });
 */
export function proxyGet(options: ProxyGetOptions) {
  const { endpoint, forwardParams = [], errorMessage = "An error occurred" } = options;

  return withAuthGet(async ({ req, session }) => {
    const params = new URLSearchParams();
    for (const param of forwardParams) {
      const value = req.nextUrl.searchParams.get(param);
      if (value) params.set(param, value);
    }
    const qs = params.toString();
    const url = `${process.env.API_URL}${endpoint}${qs ? `?${qs}` : ""}`;

    const request = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  }, errorMessage);
}
