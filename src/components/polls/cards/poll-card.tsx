"use client";
import { Poll } from "@/lib/types/polls";
import {
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CheckboxGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useMemo, useState } from "react";
import PollOptionRow from "./poll-option-row";
import Link from "next/link";
import isInAudience from "@/lib/in-audience";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { generateToken } from "@/lib/recaptcha";
import useServerError from "@/components/hooks/localization/server-errors";
import useCannotVoteReasons from "@/components/hooks/localization/cannot-vote";

type Props = {
  poll: Poll;
  mode?: "full" | "compact";
};

const PollFullCard: FC<Props> = ({ poll }) => {
  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const cannotVoteReasons = useCannotVoteReasons();
  const [loading, setLoading] = useState(false);
  const serverErrors = useServerError();
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>(
    localPoll.selected_options ?? []
  );

  const { user } = localPoll;
  const t = useTranslations("polls");
  const session = useSession();
  const canAnswer = isInAudience(localPoll, session.data?.user);

  useEffect(() => {
    // If the array exceeds the limit, remove the oldest selected option
    if (selectedOptions.length > localPoll.max_selections) {
      toast.warning(t("maxSelections", { max: localPoll.max_selections }));
      setSelectedOptions((prevSelected) =>
        prevSelected.slice(-localPoll.max_selections)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const vote = async () => {
    setLoading(true);
    const token = await generateToken("poll_vote");
    const req = await fetch(`/api/polls/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poll_id: localPoll.id,
        poll_option_id: selectedOptions,
        recaptcha_token: token,
      }),
    });
    if (req.ok) {
      toast.success(t("voteSuccess"));
      setLocalPoll((prevPoll) => ({
        ...prevPoll,
        has_voted: true,
        selected_options: selectedOptions,
      }));
    } else {
      const data = await req.json();
      toast.error(serverErrors(data?.messages?.[0] ?? "unknownError"));
    }
    setLoading(false);
  };

  const reactToPoll = async (reaction: "up" | "down") => {
    if (
      (localPoll.has_downvoted && reaction === "down") ||
      (localPoll.has_upvoted && reaction === "up")
    ) {
      toast.warning(t("alreadyReacted"));
      return;
    }
    setLoading(true);
    const token = await generateToken("poll_vote");
    const req = await fetch(`/api/polls/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poll_id: localPoll.id,
        reaction,
        recaptcha_token: token,
      }),
    });
    if (req.ok) {
      toast.success(t("reactSuccess"));
      setLocalPoll((prevPoll) => {
        // if the user has already reacted, remove the reaction
        let newUps = prevPoll.ups_count ?? 0;
        let newDowns = prevPoll.downs_count ?? 0;
        if (localPoll.has_upvoted) {
          newUps -= 1;
          if (localPoll.has_downvoted) {
            newDowns -= 1;
          }
        }
        if (localPoll.has_downvoted) {
          newDowns -= 1;
          if (localPoll.has_upvoted) {
            newUps -= 1;
          }
        }
        return {
          ...prevPoll,
          has_downvoted: reaction === "down",
          has_upvoted: reaction === "up",
          ups_count: reaction === "up" ? newUps + 1 : newUps,
          downs_count: reaction === "down" ? newDowns + 1 : newDowns,
          has_reacted: true,
        };
      });
    } else {
      const data = await req.json();
      toast.error(serverErrors(data?.messages?.[0] ?? "unknownError"));
    }
    setLoading(false);
  };

  const pollExpired = useMemo(() => {
    return new Date(localPoll.end_date) < new Date();
  }, [localPoll.end_date]);

  const canVote = useMemo(() => {
    return (
      session.status === "authenticated" &&
      !localPoll.has_voted &&
      canAnswer[0] &&
      !pollExpired
    );
  }, [canAnswer, localPoll.has_voted, session.status, pollExpired]);

  return (
    <Card>
      <CardHeader className="flex items-start gap-1.5">
        <Avatar
          src={user.avatar}
          className="min-h-10 min-w-10"
          alt={`${user.name} ${user.surname}`}
          title={`${user.name} ${user.surname}`}
        />
        <Link className="font-medium w-full" href={`/polls/${localPoll.id}`}>
          {localPoll.question}
        </Link>
        <Dropdown>
          <DropdownTrigger>
            <EllipsisVerticalIcon className="h-6 w-6 text-gray-700 cursor-pointer" />
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="author"
              startContent={<UserIcon className="size-5" />}
            >
              {t("actions.author")}
            </DropdownItem>
            <DropdownItem
              key="timeline"
              startContent={<CalendarDaysIcon className="size-5" />}
            >
              {t("actions.timeline")}
            </DropdownItem>
            <DropdownItem
              key="audience"
              startContent={<UserGroupIcon className="size-5" />}
            >
              {t("actions.audience")}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {/* <Popover>
          <PopoverTrigger>
            <InformationCircleIcon className="h-6 w-6 text-gray-700 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="max-w-72 p-3">
            {t("postedBy", {
              name: `${user.name} ${user.surname}`,
              created_at: new Date(poll.created_at).toLocaleDateString(),
              start_date: new Date(poll.start_date).toLocaleDateString(),
              end_date: new Date(poll.end_date).toLocaleDateString(),
            })}
          </PopoverContent>
        </Popover> */}
      </CardHeader>
      <CardBody className="space-y-2">
        <CheckboxGroup
          classNames={{
            base: "w-full",
          }}
          value={selectedOptions}
          onChange={setSelectedOptions}
        >
          {localPoll.options.map((option) => (
            <PollOptionRow
              key={option.id}
              option={option.option_text}
              value={option.id}
              percentage={option.percentage ?? 0}
            />
          ))}
        </CheckboxGroup>
      </CardBody>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            startContent={<HandThumbUpIcon className="w-6 h-6" />}
            isDisabled={session.status !== "authenticated" || loading}
            onPress={() => reactToPoll("up")}
            color={localPoll.has_upvoted ? "primary" : "default"}
          >
            {localPoll.ups_count}
          </Button>
          <Button
            size="sm"
            startContent={<HandThumbDownIcon className="w-6 h-6" />}
            isDisabled={session.status !== "authenticated" || loading}
            onPress={() => reactToPoll("down")}
            color={localPoll.has_downvoted ? "primary" : "default"}
          >
            {localPoll.downs_count}
          </Button>
        </div>
        {canVote ? (
          <Button
            size="sm"
            color="primary"
            onPress={vote}
            isDisabled={loading}
            isLoading={loading}
          >
            {t("vote")}
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger>
              <Button size="sm" color="default">
                {t("vote")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 text-start">
              <span className="font-medium">{t("cannotVote")}</span>
              {!canAnswer[0] && (
                <p className="w-full text-start">
                  - {cannotVoteReasons.not_in_audience}
                </p>
              )}
              {localPoll.has_voted && (
                <p className="w-full text-start">
                  - {cannotVoteReasons.has_voted}
                </p>
              )}
              {pollExpired && (
                <p className="w-full text-start">
                  - {cannotVoteReasons.poll_expired}
                </p>
              )}
            </PopoverContent>
          </Popover>
        )}
      </CardFooter>
    </Card>
  );
};

export default PollFullCard;
