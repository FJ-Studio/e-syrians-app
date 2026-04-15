import { ESUser } from "./account";

/**
 * Derived on the backend from the four timeline timestamps — the frontend
 * never recomputes this from raw dates so the logic lives in one place.
 */
export const featureStatuses = ["idea", "in_development", "in_testing", "shipped"] as const;
export type FeatureStatus = (typeof featureStatuses)[number];

export const featureSorts = ["newest", "popular", "shipped"] as const;
export type FeatureSort = (typeof featureSorts)[number];

export type FeatureTimeline = {
  /** The "just an idea" moment — row's `created_at`. Always present. */
  created_at: string;
  coded_at: string | null;
  tested_at: string | null;
  deployed_at: string | null;
};

/**
 * Admin-written progress note. Only embedded on the detail (`show`) payload;
 * list responses send a `notes_count` chip instead to keep cards light.
 * Populated by Step 7 of the rollout — this shape is already defined so the
 * detail page can lay out around it.
 */
export type FeatureRequestNote = {
  id: string;
  body: string;
  author: Pick<ESUser, "id" | "name" | "surname" | "avatar">;
  created_at: string;
  updated_at: string;
  was_edited: boolean;
};

export type FeatureRequest = {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  timeline: FeatureTimeline;
  ups_count: number;
  downs_count: number;
  /** Pre-computed on the API (ups - downs) so every client sorts identically. */
  score: number;
  user: ESUser;
  /**
   * Present whenever the viewer is authenticated. Always `false` for guests,
   * regardless of what the row actually contains.
   */
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  /** Present only on the detail `show` response (Step 7 — notes). */
  notes?: FeatureRequestNote[];
  /** Present on list rows so cards can show a "3 notes" chip without bodies. */
  notes_count?: number;
  created_at: string;
  /** Only surfaced to admins / only on admin-scoped endpoints. */
  deleted_at?: string | null;
  deletion_reason?: string | null;
};

export interface CreateFeatureRequestFields {
  title: string;
  description: string;
}
