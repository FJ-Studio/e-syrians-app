import { withAuthGet } from "@/lib/api-route";
import { NextResponse } from "next/server";

/**
 * GET /api/account/overview
 *
 * Aggregates data from multiple backend endpoints into a single overview
 * payload for the account dashboard landing page.
 *
 * Returns: profile, polls summary, verifications summary.
 */
export const GET = withAuthGet(async ({ session }) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${session.user.accessToken}`,
  };

  // Fan out requests in parallel
  const [profileRes, pollsRes, verificationsRes, verifiersRes] = await Promise.allSettled([
    fetch(`${process.env.API_URL}/users/me`, { headers }),
    fetch(`${process.env.API_URL}/users/my-polls?page=1`, { headers }),
    fetch(`${process.env.API_URL}/users/my-verifications?page=1`, {
      headers,
    }),
    fetch(`${process.env.API_URL}/users/my-verifiers?page=1`, { headers }),
  ]);

  // Helper: safely extract JSON from a settled fetch result
  const extract = async (result: PromiseSettledResult<Response>): Promise<Record<string, unknown> | null> => {
    if (result.status === "rejected") return null;
    try {
      if (!result.value.ok) return null;
      return await result.value.json();
    } catch {
      return null;
    }
  };

  const [profileJson, pollsJson, verificationsJson, verifiersJson] = await Promise.all([
    extract(profileRes),
    extract(pollsRes),
    extract(verificationsRes),
    extract(verifiersRes),
  ]);

  // --- Profile ---
  const profile = profileJson?.success ? (profileJson.data as Record<string, unknown>) : null;

  // --- Polls summary ---
  type PollEntry = {
    id: string;
    question: string;
    votes_count: number;
    start_date: string;
    end_date: string;
    deleted_at: string | null;
    created_at: string;
  };

  const pollsData = pollsJson?.success ? (pollsJson.data as { polls: PollEntry[]; total: number }) : null;

  const polls = {
    total: pollsData?.total ?? 0,
    recent: (pollsData?.polls ?? []).slice(0, 3).map((p) => ({
      id: p.id,
      question: p.question,
      votes_count: p.votes_count,
      start_date: p.start_date,
      end_date: p.end_date,
      active: !p.deleted_at,
    })),
  };

  // --- Verifications summary ---
  // Backend returns data as a plain array (verifications given) or
  // ResourceCollection (verifications received), so count via Array.length.
  const verificationsGiven = verificationsJson?.success ? (verificationsJson.data as unknown[]) : [];

  const verificationsReceived = verifiersJson?.success ? (verifiersJson.data as unknown[]) : [];

  const verifications = {
    received: Array.isArray(verificationsReceived) ? verificationsReceived.length : 0,
    given: Array.isArray(verificationsGiven) ? verificationsGiven.length : 0,
  };

  // --- Profile completeness ---
  const completenessFields = [
    "name",
    "surname",
    "gender",
    "birth_date",
    "hometown",
    "ethnicity",
    "religious_affiliation",
    "country",
    "city",
    "avatar",
    "national_id",
    "education_level",
    "source_of_income",
    "health_status",
    "languages",
  ] as const;

  let filledCount = 0;
  if (profile) {
    for (const field of completenessFields) {
      if (profile[field]) filledCount++;
    }
  }

  const profileCompleteness = {
    filled: filledCount,
    total: completenessFields.length,
    percentage: Math.round((filledCount / completenessFields.length) * 100),
  };

  return NextResponse.json({
    success: true,
    data: {
      profile,
      polls,
      verifications,
      profileCompleteness,
    },
  });
}, "Failed to load account overview");
