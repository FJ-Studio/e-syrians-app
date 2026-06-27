/**
 * fetchAllPages — walks a Laravel-paginated endpoint to completion.
 *
 * The verifications tables (Received + Sent) need this because:
 *   - The Sent list filters cancelled rows client-side. With
 *     `per_page=25` and a user who cancelled some rows and
 *     verified more, active rows can spill onto page 2 — fetching
 *     only page 1 silently hides them.
 *   - The Received list is unbounded; >25 verifiers would be
 *     truncated by a page-1-only fetch.
 *
 * Both endpoints return:
 *   { success, data: { [key]: T[], current_page, last_page, per_page, total } }
 * where `key` is "verifications" or "verifiers". The caller passes
 * the key in via `dataKey`; we accumulate that array across pages
 * and resolve once `current_page >= last_page`.
 *
 * Safety rails:
 *   - Hard cap on iterations (100 pages = 2500 rows at per_page=25)
 *     to defend against a bad backend response.
 *   - Mid-walk failures THROW rather than silently returning the
 *     accumulated partial result. An earlier version returned
 *     whatever it had collected so far, which the table then
 *     rendered as if complete — masking the missing rows behind
 *     a confident-looking list. Throwing lets the caller's
 *     try/catch surface an error state and trigger a retry.
 */
export async function fetchAllPages<T>(baseUrl: string, dataKey: string, init?: RequestInit): Promise<T[]> {
  const acc: T[] = [];
  const MAX_PAGES = 100;
  let page = 1;
  // The separator depends on whether the caller's URL already has
  // a query string. Simple presence check is sufficient — no
  // existing call site sends a `?` inside the path itself.
  const sep = baseUrl.includes("?") ? "&" : "?";
  for (let i = 0; i < MAX_PAGES; i += 1) {
    const url = `${baseUrl}${sep}page=${page}`;
    const res = await fetch(url, init);
    if (!res.ok) {
      // First-page failure looks the same as any other to the
      // caller: an error to surface. We include the page number
      // so the toast / log can pinpoint which page broke; useful
      // when the user reports "I only see 25 of my 80 verifiers".
      throw new Error(`fetchAllPages: HTTP ${res.status} on page ${page} of ${baseUrl}`);
    }
    let body: {
      data?: Record<string, unknown> & {
        current_page?: number;
        last_page?: number;
      };
    };
    try {
      body = await res.json();
    } catch (err) {
      throw new Error(
        `fetchAllPages: invalid JSON on page ${page} of ${baseUrl} (${
          err instanceof Error ? err.message : String(err)
        })`,
      );
    }
    const pageRows = (body?.data?.[dataKey] as T[] | undefined) ?? [];
    acc.push(...pageRows);
    const current = body?.data?.current_page ?? page;
    const last = body?.data?.last_page ?? page;
    if (current >= last) break;
    page = current + 1;
  }
  return acc;
}
