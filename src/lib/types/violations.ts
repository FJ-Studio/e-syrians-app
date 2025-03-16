import { ESUser } from "./account";

export type Violation = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    user: ESUser;
    status: "pending" | "published" | "removed";
    votes_count: number;
    ups_count: number;
    downs_count: number;
    has_voted?: boolean;
    has_upvoted?: boolean;
    has_downvoted?: boolean;
    has_reacted?: boolean;
}