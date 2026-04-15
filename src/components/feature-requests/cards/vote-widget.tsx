"use client";

import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button } from "@heroui/react";
import handThumbDownIcon from "@iconify-icons/heroicons/hand-thumb-down";
import handThumbUpIcon from "@iconify-icons/heroicons/hand-thumb-up";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

type Direction = "up" | "down";

type VoteState = {
  ups_count: number;
  downs_count: number;
  has_upvoted: boolean;
  has_downvoted: boolean;
};

type Props = {
  featureRequestId: number | string;
  ups_count: number;
  downs_count: number;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  /** When true the widget is display-only (e.g. before hydration). */
  readOnly?: boolean;
  /** Visual size — sm for list cards, md for detail page. */
  size?: "sm" | "md";
};

/**
 * Apply the toggle semantics locally so `useOptimistic` can reflect the
 * pending state immediately. Mirrors the Laravel service logic: same
 * direction removes the vote, opposite direction switches it, none adds it.
 */
const applyVote = (state: VoteState, direction: Direction): VoteState => {
  const sameDirection = (direction === "up" && state.has_upvoted) || (direction === "down" && state.has_downvoted);
  if (sameDirection) {
    return {
      ...state,
      ups_count: direction === "up" ? Math.max(0, state.ups_count - 1) : state.ups_count,
      downs_count: direction === "down" ? Math.max(0, state.downs_count - 1) : state.downs_count,
      has_upvoted: direction === "up" ? false : state.has_upvoted,
      has_downvoted: direction === "down" ? false : state.has_downvoted,
    };
  }
  // Opposite direction → switch. Neither → add.
  const addingUp = direction === "up";
  return {
    ...state,
    ups_count: addingUp ? state.ups_count + 1 : state.has_upvoted ? Math.max(0, state.ups_count - 1) : state.ups_count,
    downs_count: !addingUp
      ? state.downs_count + 1
      : state.has_downvoted
        ? Math.max(0, state.downs_count - 1)
        : state.downs_count,
    has_upvoted: addingUp,
    has_downvoted: !addingUp,
  };
};

/**
 * Interactive thumbs up/down widget. Uses `useOptimistic` to reflect the
 * click immediately while the POST to `/api/feature-requests/vote` is in
 * flight, rolling back on error (by committing the last known-good state).
 *
 * Unauthenticated users see the counts but clicks toast a sign-in hint.
 * Pass `readOnly` to render static counts (useful for soft-deleted or
 * admin-list contexts).
 */
const VoteWidget: FC<Props> = ({
  featureRequestId,
  ups_count,
  downs_count,
  has_upvoted = false,
  has_downvoted = false,
  readOnly = false,
  size = "sm",
}) => {
  const t = useTranslations("feature_requests.vote");
  const serverErrors = useServerError();
  const { status } = useSession();

  const [committed, setCommitted] = useState<VoteState>({
    ups_count,
    downs_count,
    has_upvoted,
    has_downvoted,
  });
  const [optimistic, applyOptimistic] = useOptimistic<VoteState, Direction>(committed, (state, direction) =>
    applyVote(state, direction),
  );
  const [pending, startTransition] = useTransition();

  const handle = (direction: Direction) => {
    if (readOnly) return;
    if (status !== "authenticated") {
      toast.warning(t("sign_in"));
      return;
    }
    startTransition(async () => {
      applyOptimistic(direction);
      try {
        const token = await generateToken("feature_request_vote");
        const response = await fetch(`/api/feature-requests/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature_request_id: featureRequestId,
            vote: direction,
            recaptcha_token: token,
          }),
        });
        if (response.ok) {
          setCommitted((prev) => applyVote(prev, direction));
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = data?.messages?.[0];
          toast.error(msg ? serverErrors(msg) : t("error"));
        }
      } catch {
        toast.error(t("error"));
      }
    });
  };

  const disabled = readOnly || pending;

  return (
    <div className="flex items-center gap-1">
      <Button
        size={size}
        variant="flat"
        startContent={<Icon icon={handThumbUpIcon} className="h-4 w-4" />}
        color={optimistic.has_upvoted ? "primary" : "default"}
        isDisabled={disabled}
        onPress={() => handle("up")}
        aria-label={t("upvote")}
      >
        {optimistic.ups_count}
      </Button>
      <Button
        size={size}
        variant="flat"
        startContent={<Icon icon={handThumbDownIcon} className="h-4 w-4" />}
        color={optimistic.has_downvoted ? "danger" : "default"}
        isDisabled={disabled}
        onPress={() => handle("down")}
        aria-label={t("downvote")}
      >
        {optimistic.downs_count}
      </Button>
    </div>
  );
};

export default VoteWidget;
