import CreatePoll from "@/components/account/dashboard/polls/create-poll";
import { getPollForEdit } from "@/lib/api/requests";
import { MAX_AUDIENCE_AGE, MIN_AUDIENCE_AGE } from "@/lib/constants/census";
import { isMissingAudience, PollAudienceSavedListSummary } from "@/lib/types/audience";
import { Locale } from "@/lib/types/locale";
import { CreatePollFields, Poll, PollAudience, PollAudienceMode, PollReveal } from "@/lib/types/polls";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

/**
 * /account/polls/[id]/edit — server-rendered shell that loads
 * the poll, hydrates it into the form's CreatePollFields shape,
 * and hands off to the shared CreatePoll component in `mode="edit"`.
 *
 * Server-side guards (defence in depth):
 *   - 404 if the poll doesn't exist.
 *   - Redirect to /account/polls if the viewer isn't the creator
 *     OR the poll already has votes (i.e. is_editable !== true).
 *     The backend would 403 the PATCH anyway, but failing early
 *     avoids dropping the user into a form they can't submit.
 *
 * Note: `audience` is only returned by PollResource when the
 * authenticated request is the creator, so its presence implicitly
 * also confirms ownership.
 */
export default async function EditPollPage({ params }: Props) {
  const { id } = await params;
  // getPollForEdit hits the creator-only `/polls/{id}/edit`
  // endpoint, which returns the audience block in full. The public
  // show endpoint suppresses creator-only details; without using
  // the edit-specific endpoint the form could not safely round-trip
  // the current targeting state.
  const res = await getPollForEdit(id);
  if (!res?.data) {
    notFound();
  }

  const poll = res.data;
  if (poll.is_editable !== true) {
    redirect("/account/polls");
  }

  const initialValues = mapPollToFormFields(poll);
  const initialOptions = poll.options.map((o) => o.option_text);

  return (
    <CreatePoll mode="edit" pollId={String(poll.id)} initialValues={initialValues} initialOptions={initialOptions} />
  );
}

/**
 * Map a Poll resource into the form's CreatePollFields shape.
 * Inverse of the FormData-building dance the CreatePoll component
 * does on submit:
 *   - Numbers (max_selections, duration) → strings (NumberInput is
 *     happiest with string + onChange).
 *   - Booleans / boolean-ish columns → "0" / "1" strings (matches
 *     the Select values throughout the form).
 *   - start_date / end_date → start_date + computed `duration`
 *     (full days between, mirroring `start + duration` formula
 *     the backend uses to compute end_date).
 *   - Audience: split into arrays-per-criterion.
 */
function mapPollToFormFields(poll: Poll): Partial<CreatePollFields> {
  const start = new Date(poll.start_date);
  const end = new Date(poll.end_date);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // Detect a saved-list poll first — the backend both flags it explicitly
  // (`audience_is_saved_list`) and includes a nested `audience.audience`
  // block. Checking both keeps this future-proof if either signal
  // becomes the sole one.
  //
  // The nested `audience` may be the summary shape OR the sentinel
  // `{ status: "missing" }` when the referenced audience has since
  // been soft-deleted. Only the summary variant carries a uuid, so
  // we pluck it via `isMissingAudience` — reading `.uuid` blind
  // would fail typecheck (correctly).
  const savedListSummary = poll.audience as PollAudienceSavedListSummary | undefined;
  const savedListAudience = savedListSummary?.audience;
  const savedListUuid = savedListAudience && !isMissingAudience(savedListAudience) ? savedListAudience.uuid : undefined;
  const isSavedList = poll.audience_is_saved_list === true || savedListUuid !== undefined;

  const inlineAudience = (isSavedList ? undefined : (poll.audience as PollAudience | undefined)) ?? undefined;

  const mode: PollAudienceMode = isSavedList ? "saved_list" : "demographics";

  return {
    question: poll.question,
    start_date: poll.start_date.split("T")[0],
    duration: String(durationDays),
    max_selections: String(poll.max_selections),
    audience_can_add_options: poll.audience_can_add_options ? "1" : "0",
    reveal_results: poll.reveal_results as PollReveal,
    voters_are_visible: poll.voters_are_visible ? "1" : "0",
    audience_only: poll.audience_only ? "1" : "0",
    audience_mode: mode,
    audience_uuid: isSavedList ? savedListUuid : undefined,
    audience: {
      age_range: {
        min: inlineAudience?.age_range?.min ?? MIN_AUDIENCE_AGE,
        max: inlineAudience?.age_range?.max ?? MAX_AUDIENCE_AGE,
      },
      gender: inlineAudience?.gender ?? [],
      country: inlineAudience?.country ?? [],
      religious_affiliation: inlineAudience?.religious_affiliation ?? [],
      hometown: inlineAudience?.hometown ?? [],
      ethnicity: inlineAudience?.ethnicity ?? [],
      province: inlineAudience?.province ?? [],
    },
  };
}
