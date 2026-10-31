export type AudienceEntryTypeValue = "email" | "national_id";

/**
 * Privacy-safe entry row exposed by AudienceEntryResource. The backend
 * intentionally reduces the resolved user to a boolean — see the resource
 * class comment for why we NEVER receive the resolved uuid / name here.
 */
export interface AudienceEntry {
  id: number;
  identifier: string;
  identifier_type: AudienceEntryTypeValue;
  resolved: boolean;
  created_at: string;
}

/** Shape returned by GET /users/audiences (list) and per-audience endpoints. */
export interface Audience {
  uuid: string;
  name: string;
  description: string | null;
  entries_total_count: number;
  entries_resolved_count: number;
  /** Only present on the detail / mutation endpoints. */
  entries?: AudienceEntry[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Compact shape included inside a poll payload (and inside the
 * `GET /polls/audience` response) when the poll uses a saved list.
 *
 * The nested `audience` key is either a summary or a
 * `{ status: "missing" }` sentinel — the backend uses the latter
 * when `polls.audience_id` still points at an audience that has
 * since been soft-deleted. Clients should render "the list was
 * deleted" in that case, NOT the summary layout.
 */
export type PollAudienceSummary = {
  uuid: string;
  name: string;
  entries_total_count: number;
  entries_resolved_count: number;
};

export interface PollAudienceSavedListSummary {
  audience: PollAudienceSummary | { status: "missing" };
}

/** Type guard for the "missing" variant of the saved-list audience. */
export const isMissingAudience = (a: PollAudienceSavedListSummary["audience"]): a is { status: "missing" } =>
  "status" in a && a.status === "missing";
