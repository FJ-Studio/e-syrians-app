import { ESUser } from "./account";
import { PollAudienceSavedListSummary } from "./audience";

/**
 * Full audience details. Only returned by the API to the poll's creator
 * (e.g. when editing a poll in the dashboard). Regular viewers receive
 * `is_in_audience` + `audience_failures` instead.
 */
export type PollAudience = {
  gender: string[];
  age_range: {
    min: number;
    max: number;
  };
  country: string[];
  religious_affiliation: string[];
  hometown: string[];
  ethnicity: string[];
  province: string[];
};

/**
 * Per-criterion failure keys returned by the backend when the current user
 * is not in the audience. Matches `User::isInAudience` failure keys plus
 * `unauthenticated` for guests and `not_in_allowed_voters` for list misses.
 */
export type AudienceFailure =
  | "unauthenticated"
  | "not_in_allowed_voters"
  | "birth_date_missing"
  | "age_min"
  | "age_max"
  | "gender"
  | "gender_missing"
  | "country"
  | "country_missing"
  | "hometown"
  | "hometown_missing"
  | "religious_affiliation"
  | "religious_affiliation_missing"
  | "ethnicity"
  | "ethnicity_missing"
  | "province"
  | "province_missing";

export const pollResultsReveal = ["before-voting", "after-voting", "after-expiration"] as const;
export type PollReveal = (typeof pollResultsReveal)[number];

export type PollOption = {
  id: string;
  option_text: string;
  votes_count?: number;
  percentage?: number;
  voters_preview?: PollVoter[];
};
export type Poll = {
  id: string;
  start_date: string;
  end_date: string;
  question: string;
  options: Array<PollOption>;
  /**
   * Demographic audience block. When the poll is gated by a reusable
   * saved audience the shape is `PollAudienceSavedListSummary` and
   * `audience_is_saved_list` is true — the client should branch on that
   * flag before reading the criteria keys.
   */
  audience?: PollAudience | PollAudienceSavedListSummary;
  /**
   * True iff the poll is gated by a reusable saved audience (backend
   * flag). The `audience` field will then match `PollAudienceSavedListSummary`.
   */
  audience_is_saved_list?: boolean;
  audience_only: boolean;
  /** Whether the current viewer is eligible to vote on this poll. */
  is_in_audience: boolean;
  /** Failure reasons when `is_in_audience` is false; empty array otherwise. */
  audience_failures: AudienceFailure[];
  max_selections: number;
  audience_can_add_options: boolean;
  deletion_reason: string | null;
  created_at: string;
  deleted_at?: string;
  votes_count: number;
  ups_count: number;
  downs_count: number;
  user: ESUser;
  reveal_results: PollReveal;
  voters_are_visible: boolean;
  has_voted?: boolean;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  has_reacted?: boolean;
  selected_options?: Array<string>;
  unique_voters_count?: number;
  /**
   * Creator-only flag from the backend. True iff the poll has zero
   * votes — once anyone casts a vote the poll becomes immutable and
   * the My Polls "Edit" action should hide.
   */
  is_editable?: boolean;
};

/**
 * Form-shaped demographic audience used by the create/edit poll form.
 * Arrays for multi-selects; age range uses numbers for the slider
 * component.
 */
export type CreatePollAudienceFields = {
  gender: string[];
  age_range: { min: number; max: number };
  country: string[];
  religious_affiliation: string[];
  hometown: string[];
  ethnicity: string[];
  province: string[];
};

/**
 * Which audience-selection UI the form is currently on. The two modes
 * are mutually exclusive — the client sends ONLY the fields for the
 * active mode, matching the backend's `StorePollRequest` gate.
 */
export type PollAudienceMode = "demographics" | "saved_list";

export interface CreatePollFields {
  question: string;
  start_date: string;
  duration: string;
  options: string[];
  audience: CreatePollAudienceFields;
  /** Active audience mode in the form. Defaults to `demographics`. */
  audience_mode: PollAudienceMode;
  /** UUID of the saved audience to attach — only meaningful when `audience_mode === "saved_list"`. */
  audience_uuid?: string;
  max_selections: string;
  audience_can_add_options: "0" | "1";
  reveal_results: PollReveal;
  voters_are_visible: "0" | "1";
  audience_only: "0" | "1";
}

export type PollVoter = {
  id: string;
  name: string;
  surname: string;
  avatar?: string;
};

export type PollVotersResponse = {
  success: boolean;
  data: {
    data: PollVoter[];
    current_page: number;
    last_page: number;
    total: number;
  };
};

export type ReactionLog = {
  id: string;
  poll_id: string;
  reaction: "up" | "down";
  created_at: string;
  poll: {
    id: string;
    question: string;
  };
};
export type VoteLog = {
  poll_id: string;
  question: string;
  selected_options: string[];
  created_at: string;
};
