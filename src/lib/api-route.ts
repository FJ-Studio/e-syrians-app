import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { auth } from "../../auth";
import recaptchaIsValid from "@/lib/recaptcha";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface ApiRouteOptions {
  requireAuth?: boolean;
  requireRecaptcha?: boolean;
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
 * Wraps a JSON-body API route with auth, recaptcha, and error handling.
 */
export function withApiRoute(
  handler: RouteHandler,
  options: ApiRouteOptions = {}
) {
  const {
    requireAuth = true,
    requireRecaptcha = false,
    errorMessage = "An error occurred",
  } = options;

  return async (req: NextRequest) => {
    try {
      const body = await req.json();

      if (requireRecaptcha) {
        const isHuman = await recaptchaIsValid(body.recaptcha_token);
        if (!isHuman) {
          return NextResponse.json(
            { success: false, messages: ["invalid_recaptcha_token"] },
            { status: 400 }
          );
        }
      }

      let session: Session | null = null;
      if (requireAuth) {
        session = await auth();
        if (!session?.user.accessToken) {
          return NextResponse.json(
            { success: false, messages: ["Unauthorized"] },
            { status: 401 }
          );
        }
      }

      return await handler({ req, session, body });
    } catch {
      return NextResponse.json(
        { success: false, messages: [errorMessage] },
        { status: 500 }
      );
    }
  };
}

/**
 * Wraps a FormData-body API route with auth, recaptcha, and error handling.
 */
export function withFormDataApiRoute(
  handler: FormDataRouteHandler,
  options: ApiRouteOptions = {}
) {
  const {
    requireAuth = true,
    requireRecaptcha = false,
    errorMessage = "An error occurred",
  } = options;

  return async (req: NextRequest) => {
    try {
      let session: Session | null = null;
      if (requireAuth) {
        session = await auth();
        if (!session?.user.accessToken) {
          return NextResponse.json(
            { success: false, messages: ["Unauthorized"] },
            { status: 401 }
          );
        }
      }

      const body = await req.formData();

      if (requireRecaptcha) {
        const isHuman = await recaptchaIsValid(
          body.get("recaptcha_token") as string
        );
        if (!isHuman) {
          return NextResponse.json(
            { success: false, messages: ["invalid_recaptcha_token"] },
            { status: 400 }
          );
        }
      }

      return await handler({ req, session, body });
    } catch {
      return NextResponse.json(
        { success: false, messages: [errorMessage] },
        { status: 500 }
      );
    }
  };
}

/**
 * Wraps a GET route with auth and error handling.
 */
export function withAuthGet(
  handler: (params: {
    req: NextRequest;
    session: Session;
  }) => Promise<NextResponse>,
  errorMessage = "An error occurred"
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user.accessToken) {
        return NextResponse.json(
          { success: false, messages: ["Unauthorized"] },
          { status: 401 }
        );
      }
      return await handler({ req, session });
    } catch {
      return NextResponse.json(
        { success: false, messages: [errorMessage] },
        { status: 500 }
      );
    }
  };
}

// ---------------------------------------------------------------------------
// High-level proxy helpers (for routes that just forward to the backend)
// ---------------------------------------------------------------------------

interface ProxyJsonPostOptions {
  /** Backend endpoint path, e.g. "/users/update/address" */
  endpoint: string;
  requireRecaptcha?: boolean;
  errorMessage?: string;
  /** Optional transform of the incoming body before sending to backend */
  transformBody?: (body: Record<string, unknown>) => Record<string, unknown>;
  /** Optional callback after a successful backend response */
  onSuccess?: (
    response: Record<string, unknown>,
    session: Session,
    backendStatus: number
  ) => Promise<NextResponse | void>;
}

/**
 * Creates a POST route that proxies JSON to the backend.
 * Handles auth, recaptcha, error wrapping, and JSON forwarding in one call.
 *
 * Usage:
 *   export const POST = proxyJsonPost({ endpoint: "/users/update/address", requireRecaptcha: true });
 */
export function proxyJsonPost(options: ProxyJsonPostOptions) {
  const {
    endpoint,
    requireRecaptcha = true,
    errorMessage = "An error occurred",
    transformBody,
    onSuccess,
  } = options;

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
    { requireAuth: true, requireRecaptcha, errorMessage }
  );
}

interface ProxyFormDataPostOptions {
  /** Backend endpoint path, e.g. "/users/update/avatar" */
  endpoint: string;
  requireRecaptcha?: boolean;
  requireAuth?: boolean;
  errorMessage?: string;
  /** Extra headers to forward from the incoming request (e.g. ["Accept-Language"]) */
  forwardHeaders?: string[];
}

/**
 * Creates a POST route that proxies FormData to the backend.
 * Handles auth, recaptcha, error wrapping, and FormData forwarding.
 *
 * Usage:
 *   export const POST = proxyFormDataPost({ endpoint: "/users/update/avatar", forwardHeaders: ["Accept-Language"] });
 */
export function proxyFormDataPost(options: ProxyFormDataPostOptions) {
  const {
    endpoint,
    requireRecaptcha = true,
    requireAuth = true,
    errorMessage = "An error occurred",
    forwardHeaders = [],
  } = options;

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
    { requireAuth, requireRecaptcha, errorMessage }
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
  const { endpoint, forwardParams = [], errorMessage = "An error occurred" } =
    options;

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
