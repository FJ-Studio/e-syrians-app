import { ESUser } from "./account";

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
  city_inside_syria: string[];
  allowed_voters?: string[];
};

/**
 * Per-criterion failure keys returned by the backend when the current user
 * is not in the audience. Matches `User::isInAudience` failure keys plus
 * `unauthenticated` for guests and `not_in_allowed_voters` for allowlist misses.
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
  | "city_inside_syria"
  | "city_inside_syria_missing";

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
  /** Only present when the authenticated user is the poll's creator. */
  audience?: PollAudience;
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
};

/**
 * Form-shaped audience used by the create/edit poll form. Arrays for
 * multi-selects; `allowed_voters` stays as raw textarea text and gets
 * parsed into a list at submit time. Age range uses numbers for the
 * slider component.
 */
export type CreatePollAudienceFields = {
  gender: string[];
  age_range: { min: number; max: number };
  country: string[];
  religious_affiliation: string[];
  hometown: string[];
  ethnicity: string[];
  city_inside_syria: string[];
  allowed_voters: string;
};

export interface CreatePollFields {
  question: string;
  start_date: string;
  duration: string;
  options: string[];
  audience: CreatePollAudienceFields;
  max_selections: string;
  audience_can_add_options: "0" | "1";
  reveal_results: PollReveal;
  voters_are_visible: "0" | "1";
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
