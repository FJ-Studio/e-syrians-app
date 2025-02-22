import { ESUser } from "./account";

export type PollAudience = {
    gender: string | null;
    age_range: {
        min: string;
        max: string;
    } | null;
    country: string | null;
    religious_affiliation: string | null;
    hometown: string | null;
    ethnicity: string | null;
}

export type PollReveal = 'before-voting' | 'after-voting' | 'after-expiration';

export type PollOption = {
    id: string;
    option_text: string;
    votes_count?: number;
    percentage?: number;
}
export type Poll = {
    id: string;
    start_date: string;
    end_date: string;
    question: string;
    options: Array<PollOption>;
    audience: PollAudience;
    max_selections: number;
    audience_can_add_options: boolean;
    deletion_reason: string | null;
    created_at: string;
    deleted_at?: string;
    votes_count: number;
    ups_count: number;
    downs_count: number;
    user: ESUser,
    reveal_results: PollReveal;
    voters_are_visible: boolean;
    has_voted?: boolean;
    has_upvoted?: boolean;
    has_downvoted?: boolean;
    has_reacted?: boolean;
    selected_options?: Array<string>;
    unique_voters_count?: number;
}

export interface CreatePollFields {
    question: string;
    start_date: string;
    duration: string;
    options: string[];
    audience: PollAudience;
    max_selections: string;
    audience_can_add_options: "0" | "1";
    reveal_results: PollReveal;
    voters_are_visible: "0" | "1";
}

export type ReactionLog = {
    id: string;
    poll_id: string;
    reaction: "up" | "down";
    created_at: string;
    poll: {
        id: string;
        question: string;
    }
}
export type VoteLog = {
    poll_id: string;
    question: string;
    selected_options: string[];
    created_at: string;
}