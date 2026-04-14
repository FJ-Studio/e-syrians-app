"use client";
import ShortUserSummary from "@/components/census/cards/short-summary";
import useCannotVoteReasons from "@/components/hooks/localization/cannot-vote";
import useServerError from "@/components/hooks/localization/server-errors";
import { ibm } from "@/lib/fonts/fonts";
import { generateToken } from "@/lib/recaptcha";
import { AudienceFailure, Poll } from "@/lib/types/polls";
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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Snippet,
  useDisclosure,
} from "@heroui/react";
import calendarDaysIcon from "@iconify-icons/heroicons/calendar-days";
import ellipsisVerticalIcon from "@iconify-icons/heroicons/ellipsis-vertical";
import handThumbDownIcon from "@iconify-icons/heroicons/hand-thumb-down";
import handThumbUpIcon from "@iconify-icons/heroicons/hand-thumb-up";
import shareIcon from "@iconify-icons/heroicons/share";
import userIcon from "@iconify-icons/heroicons/user";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PollOptionRow from "./poll-option-row";
import VotersModal from "./voters-modal";

type Props = {
  poll: Poll;
  mode?: "full" | "compact";
};

/**
 * Map a per-criterion audience failure to the cannot-vote reason key
 * used by the localization hook. `unauthenticated` is handled separately
 * via the auth status check.
 */
const failureToReasonKey: Record<
  Exclude<AudienceFailure, "unauthenticated">,
  | "age"
  | "gender"
  | "country"
  | "hometown"
  | "religious_affiliation"
  | "ethnicity"
  | "city_inside_syria"
  | "not_in_allowed_voters"
> = {
  not_in_allowed_voters: "not_in_allowed_voters",
  birth_date_missing: "age",
  age_min: "age",
  age_max: "age",
  gender: "gender",
  gender_missing: "gender",
  country: "country",
  country_missing: "country",
  hometown: "hometown",
  hometown_missing: "hometown",
  religious_affiliation: "religious_affiliation",
  religious_affiliation_missing: "religious_affiliation",
  ethnicity: "ethnicity",
  ethnicity_missing: "ethnicity",
  city_inside_syria: "city_inside_syria",
  city_inside_syria_missing: "city_inside_syria",
};

const PollFullCard: FC<Props> = ({ poll }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isVotersOpen, onOpen: onVotersOpen, onOpenChange: onVotersOpenChange } = useDisclosure();
  const [modalSection, setModalSection] = useState<"author" | "timeline" | "share" | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedOptionText, setSelectedOptionText] = useState("");

  const pollUrl = useMemo(() => {
    return `${process.env.NEXT_PUBLIC_DOMAIN_URL}/polls/${poll.id}`;
  }, [poll]);

  useEffect(() => {
    if (modalSection) {
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalSection]);

  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const cannotVoteReasons = useCannotVoteReasons();
  const [loading, setLoading] = useState(false);
  const serverErrors = useServerError();
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>(localPoll.selected_options ?? []);

  const { user } = localPoll;
  const t = useTranslations("polls");
  const { status } = useSession();

  useEffect(() => {
    // If the array exceeds the limit, remove the oldest selected option
    if (selectedOptions.length > localPoll.max_selections) {
      toast.warning(t("maxSelections", { max: localPoll.max_selections }));
      setSelectedOptions((prevSelected) => prevSelected.slice(-localPoll.max_selections));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const vote = async () => {
    if (selectedOptions.length === 0) {
      toast.warning(t("noOptionSelected"));
      return;
    }
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
      const messages: string[] = data?.messages ?? [];
      const localized = messages.map((msg: string) => serverErrors(msg));
      toast.error(localized.join("\n") || t("error"));
    }
    setLoading(false);
  };

  const reactToPoll = async (reaction: "up" | "down") => {
    if ((localPoll.has_downvoted && reaction === "down") || (localPoll.has_upvoted && reaction === "up")) {
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
    return status === "authenticated" && !localPoll.has_voted && localPoll.is_in_audience && !pollExpired;
  }, [localPoll.is_in_audience, localPoll.has_voted, status, pollExpired]);

  return (
    <>
      <Card className="p-3">
        <CardHeader className="justify-beteen flex items-center gap-2">
          <Avatar
            src={user.avatar}
            className="min-h-10 min-w-10"
            alt={`${user.name} ${user.surname}`}
            title={`${user.name} ${user.surname}`}
          />
          <Link className="flex w-full flex-col" href={`/polls/${localPoll.id}`}>
            <span className="text-default-500 text-tiny font-normal">
              {new Date(localPoll.created_at).toLocaleDateString()}
            </span>
            <p className="font-medium">{`${localPoll.user.name} ${localPoll.user.surname}`}</p>
          </Link>
          <Dropdown>
            <DropdownTrigger>
              <Icon icon={ellipsisVerticalIcon} className="h-6 w-6 cursor-pointer text-gray-700" />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="author"
                startContent={<Icon icon={userIcon} className="size-5" />}
                onPress={() => setModalSection("author")}
              >
                {t("actions.author")}
              </DropdownItem>
              <DropdownItem
                key="timeline"
                startContent={<Icon icon={calendarDaysIcon} className="size-5" />}
                onPress={() => setModalSection("timeline")}
              >
                {t("actions.timeline")}
              </DropdownItem>
              <DropdownItem
                key="share"
                startContent={<Icon icon={shareIcon} className="size-5" />}
                onPress={() => setModalSection("share")}
              >
                {t("actions.share")}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody className="items-start space-y-2 text-start">
          <p>{localPoll.question}</p>

          <CheckboxGroup
            classNames={{
              base: "w-full",
            }}
            value={selectedOptions}
            onChange={setSelectedOptions}
            isReadOnly={!canVote}
          >
            {localPoll.options.map((option) => (
              <PollOptionRow
                key={option.id}
                option={option.option_text}
                value={option.id}
                percentage={option.percentage ?? 0}
                votersPreview={option.voters_preview}
                votersAreVisible={localPoll.voters_are_visible}
                votesCount={option.votes_count}
                onShowVoters={() => {
                  setSelectedOptionId(option.id);
                  setSelectedOptionText(option.option_text);
                  onVotersOpen();
                }}
              />
            ))}
          </CheckboxGroup>
          <p className="text-default-500 mt-2 text-sm">
            {t("voters_count", { count: localPoll?.unique_voters_count ?? 0 })}
          </p>
        </CardBody>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              startContent={<Icon icon={handThumbUpIcon} className="h-6 w-6" />}
              isDisabled={status !== "authenticated" || loading}
              onPress={() => reactToPoll("up")}
              color={localPoll.has_upvoted ? "primary" : "default"}
            >
              {localPoll.ups_count}
            </Button>
            <Button
              size="sm"
              startContent={<Icon icon={handThumbDownIcon} className="h-6 w-6" />}
              isDisabled={status !== "authenticated" || loading}
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
              className="bg-[#50c0a9] px-8 text-sm"
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
              <PopoverContent className="items-start p-3 text-start">
                <span className="text-start font-medium">{t("cannotVote")}</span>
                {status === "unauthenticated" && (
                  <p className="w-full text-start">- {cannotVoteReasons.unauthorized}</p>
                )}
                {localPoll.is_in_audience === false &&
                  status === "authenticated" &&
                  (() => {
                    const specificFailures = localPoll.audience_failures.filter(
                      (f): f is Exclude<AudienceFailure, "unauthenticated"> => f !== "unauthenticated",
                    );
                    const reasonKeys = Array.from(new Set(specificFailures.map((f) => failureToReasonKey[f])));
                    if (reasonKeys.length === 0) {
                      return <p className="w-full text-start">- {cannotVoteReasons.not_in_audience}</p>;
                    }
                    return reasonKeys.map((key) => (
                      <p key={key} className="w-full text-start">
                        - {cannotVoteReasons[key]}
                      </p>
                    ));
                  })()}
                {localPoll.has_voted && <p className="w-full text-start">- {cannotVoteReasons.has_voted}</p>}
                {pollExpired && <p className="w-full text-start">- {cannotVoteReasons.poll_expired}</p>}
              </PopoverContent>
            </Popover>
          )}
        </CardFooter>
      </Card>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setModalSection(null)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-medium">
                  {modalSection === "author"
                    ? t("actions.author")
                    : modalSection === "timeline"
                      ? t("actions.timeline")
                      : modalSection === "share"
                        ? t("actions.share")
                        : ""}
                </h3>
              </ModalHeader>
              <ModalBody>
                {modalSection === "author" && <ShortUserSummary user={localPoll.user} />}
                {modalSection === "timeline" && (
                  <>
                    <p>
                      <span className="font-medium">{t("publishDate")}</span>:{" "}
                      {new Date(localPoll.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">{t("votingPeriod")}</span>:{" "}
                      {t.rich("postedBy", {
                        start_date: new Date(localPoll.start_date).toLocaleDateString(),
                        end_date: new Date(localPoll.end_date).toLocaleDateString(),
                      })}
                    </p>
                  </>
                )}
                {modalSection === "share" && (
                  <div className="grid grid-cols-2 flex-wrap gap-4">
                    <Button
                      // className="bg-blue-600 text-white"
                      as={Link}
                      target="_blank"
                      href={`https://www.facebook.com/sharer/sharer.php?u=${pollUrl}`}
                    >
                      {t("share.facebook")}
                    </Button>
                    <Button
                      // className="bg-black text-white"
                      as={Link}
                      target="_blank"
                      href={`https://twitter.com/intent/tweet?url=${pollUrl}`}
                    >
                      {t("share.x")}
                    </Button>
                    <Button
                      // className="bg-[#25d366] text-white"
                      as={Link}
                      target="_blank"
                      href={`https://wa.me/?text=${pollUrl}`}
                    >
                      {t("share.whatsapp")}
                    </Button>
                    <Button
                      // className="bg-[#0a66c2] text-white"
                      as={Link}
                      target="_blank"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${pollUrl}`}
                    >
                      {t("share.linkedin")}
                    </Button>
                    {/* <Button
                      // className="bg-[#DB4437] text-white"
                      as={Link}
                      href={`mailto:?subject=E-SYRIANS&body=${pollUrl}`}
                    >
                      {t("share.mail")}
                    </Button> */}
                    <Snippet
                      className="col-span-2"
                      classNames={{
                        pre: `${ibm.className}`,
                      }}
                      hideSymbol
                      codeString={pollUrl}
                    >
                      {/* {t("share.copy")} */}
                      {pollUrl}
                    </Snippet>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-start">
                <Button onPress={onClose} color="danger">
                  {t("close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {localPoll.voters_are_visible && (
        <VotersModal
          isOpen={isVotersOpen}
          onOpenChange={onVotersOpenChange}
          optionId={selectedOptionId}
          optionText={selectedOptionText}
        />
      )}
    </>
  );
};

export default PollFullCard;
