import { auth } from "../../../auth";
import { ESUser } from "../types/account";
import { Audience } from "../types/audience";
import { FeatureRequest, FeatureSort, FeatureStatus } from "../types/feature-requests";
import { ApiResponse } from "../types/misc";
import { Poll } from "../types/polls";

const API_URL = process.env.API_URL;

/**
 * Wraps a server-side fetch in try-catch with consistent error shape.
 * Returns null on network/parse errors so callers can handle gracefully.
 */
async function safeFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && res.status >= 500) {
      console.warn(`Backend error: ${res.status} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export const getPoll = async (id: string): Promise<ApiResponse<Poll> | null> => {
  const session = await auth();
  return safeFetch<Poll>(`${API_URL}/polls/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-cache",
  });
};

/**
 * Creator-only edit payload. Mirrors `getPoll` but hits
 * `GET /polls/{id}/edit` — which the API guards on ownership and
 * which returns the full `audience` block needed by the edit form.
 * Use this in the edit page; everywhere else keeps using `getPoll`.
 *
 * Returns null on 403 / 404 just like `getPoll` — the edit page
 * handles the missing-data path with notFound() / a redirect.
 */
export const getPollForEdit = async (id: string): Promise<ApiResponse<Poll> | null> => {
  const session = await auth();
  return safeFetch<Poll>(`${API_URL}/polls/${id}/edit`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-cache",
  });
};

export const getPolls = async (
  page: string,
  year: string = "",
  month: string = "",
): Promise<ApiResponse<{
  polls: Array<Poll>;
  current_page: number;
  last_page: number;
}> | null> => {
  const session = await auth();
  const params = new URLSearchParams({ page, year, month });
  return safeFetch(`${API_URL}/polls?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-cache",
  });
};

/**
 * Fetch a paginated list of feature requests. Mirrors `getPolls` — passes the
 * session bearer when available so the API can populate `has_upvoted` /
 * `has_downvoted` on each row. Guests get those fields as false.
 */
export const getFeatureRequests = async (
  page: string,
  sort: FeatureSort = "newest",
  status?: FeatureStatus,
): Promise<ApiResponse<{
  feature_requests: Array<FeatureRequest>;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}> | null> => {
  const session = await auth();
  const params = new URLSearchParams({ page, sort });
  if (status) params.set("status", status);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (session?.user.accessToken) {
    headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return safeFetch(`${API_URL}/feature-requests?${params.toString()}`, {
    headers,
    cache: "no-cache",
  });
};

export const getFeatureRequest = async (id: string): Promise<ApiResponse<FeatureRequest> | null> => {
  const session = await auth();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (session?.user.accessToken) {
    headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return safeFetch<FeatureRequest>(`${API_URL}/feature-requests/${id}`, {
    headers,
    cache: "no-cache",
  });
};

export const getFirstRegistrants = async (): Promise<ApiResponse<Array<ESUser>> | null> => {
  return safeFetch<Array<ESUser>>(`${API_URL}/users/first`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
    },
    cache: "force-cache",
  });
};

export const getUser = async (uuid: string): Promise<ApiResponse<ESUser> | null> => {
  return safeFetch<ESUser>(`${API_URL}/users/verify/${uuid}`, {
    next: {
      revalidate: 3600,
    },
    cache: "force-cache",
  });
};

/**
 * List the signed-in user's audiences. The backend clamps `per_page` to
 * [1, 100]; we forward whatever the caller asks for and let the API
 * enforce the ceiling. Returns null on network / 5xx so the caller can
 * render an empty state instead of crashing the page.
 */
export const getAudiences = async (
  page: string = "1",
  perPage: string = "20",
): Promise<ApiResponse<{
  audiences: Audience[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> | null> => {
  const session = await auth();
  const params = new URLSearchParams({ page, per_page: perPage });
  return safeFetch(`${API_URL}/users/audiences?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-cache",
  });
};

/**
 * Fetch a single audience (with entries loaded). Backend 404s for
 * audiences that don't belong to the signed-in user — treat the null
 * return as "not found or not yours".
 */
export const getAudience = async (uuid: string): Promise<ApiResponse<Audience> | null> => {
  const session = await auth();
  return safeFetch<Audience>(`${API_URL}/users/audiences/${uuid}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    cache: "no-cache",
  });
};

export const verifyEmail = async (
  id: string,
  expires: string | undefined,
  hash: string | undefined,
  signature: string | undefined,
): Promise<boolean> => {
  const params = new URLSearchParams();
  if (expires) params.set("expires", expires);
  if (hash) params.set("hash", hash);
  params.set("id", id);
  params.set("lang", "en");
  if (signature) params.set("signature", signature);

  try {
    const res = await fetch(`${API_URL}/verify-email?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return res.status === 200;
  } catch {
    return false;
  }
};
