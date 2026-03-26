"use client";
import { Poll } from "@/lib/types/polls";
import {
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  ShareIcon,
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
import ShortUserSummary from "@/components/census/cards/short-summary";
import { MAX_AUDIENCE_AGE } from "@/lib/constants/census";
import useGender from "@/components/hooks/localization/gender";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import useProvinces from "@/components/hooks/localization/provinces";
import useCountries from "@/components/hooks/localization/country";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import strToArray from "@/lib/str-array";
import { ibm } from "@/lib/fonts/fonts";

type Props = {
  poll: Poll;
  mode?: "full" | "compact";
};

const PollFullCard: FC<Props> = ({ poll }) => {
  const genders = useGender();
  const ethnicities = useEthnicity();
  const provinces = useProvinces();
  const countries = useCountries();
  const religinousAffiliations = useReligiousAffiliation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalSection, setModalSection] = useState<
    "author" | "timeline" | "audience" | "share" | null
  >(null);

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
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>(
    localPoll.selected_options ?? []
  );

  const { user } = localPoll;
  const t = useTranslations("polls");
  const { data, status } = useSession();
  const canAnswer = isInAudience(localPoll, data?.user);

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
    if (selectedOptions.length === 0) {
      toast.warning(t("noOptionSelected"));
      return
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
      status === "authenticated" &&
      !localPoll.has_voted &&
      canAnswer[0] &&
      !pollExpired
    );
  }, [canAnswer, localPoll.has_voted, status, pollExpired]);

  return (
    <>
      <Card className="p-3">
        <CardHeader className="flex items-center justify-beteen gap-2">
          <Avatar
            src={user.avatar}
            className="min-h-10 min-w-10"
            alt={`${user.name} ${user.surname}`}
            title={`${user.name} ${user.surname}`}
          />
          <Link
            className="w-full flex flex-col"
            href={`/polls/${localPoll.id}`}
          >
            <span className="text-default-500 font-normal text-tiny">
              {new Date(localPoll.created_at).toLocaleDateString()}
            </span>
            <p className="font-medium">{`${localPoll.user.name} ${localPoll.user.surname}`}</p>
          </Link>
          <Dropdown>
            <DropdownTrigger>
              <EllipsisVerticalIcon className="h-6 w-6 text-gray-700 cursor-pointer" />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="author"
                startContent={<UserIcon className="size-5" />}
                onPress={() => setModalSection("author")}
              >
                {t("actions.author")}
              </DropdownItem>
              <DropdownItem
                key="timeline"
                startContent={<CalendarDaysIcon className="size-5" />}
                onPress={() => setModalSection("timeline")}
              >
                {t("actions.timeline")}
              </DropdownItem>
              <DropdownItem
                key="audience"
                startContent={<UserGroupIcon className="size-5" />}
                onPress={() => setModalSection("audience")}
              >
                {t("actions.audience")}
              </DropdownItem>
              <DropdownItem
                key="share"
                startContent={<ShareIcon className="size-5" />}
                onPress={() => setModalSection("share")}
              >
                {t("actions.share")}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody className="space-y-2 items-start text-start">
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
              />
            ))}
          </CheckboxGroup>
          <p className="mt-2 text-default-500 text-sm">
            {t("voters_count", { count: localPoll?.unique_voters_count ?? 0 })}
          </p>
        </CardBody>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              startContent={<HandThumbUpIcon className="w-6 h-6" />}
              isDisabled={status !== "authenticated" || loading}
              onPress={() => reactToPoll("up")}
              color={localPoll.has_upvoted ? "primary" : "default"}
            >
              {localPoll.ups_count}
            </Button>
            <Button
              size="sm"
              startContent={<HandThumbDownIcon className="w-6 h-6" />}
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
              className="px-8 text-sm bg-[#50c0a9]"
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
              <PopoverContent className="p-3 text-start items-start">
                <span className="font-medium text-start">
                  {t("cannotVote")}
                </span>
                {status === "unauthenticated" && (
                  <p className="w-full text-start">
                    - {cannotVoteReasons.unauthorized}
                  </p>
                )}
                {canAnswer[0] === false && status === "authenticated" && (
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => setModalSection(null)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-medium">
                  {modalSection === "author"
                    ? t("actions.author")
                    : modalSection === "timeline"
                    ? t("actions.timeline")
                    : modalSection === "audience"
                    ? t("actions.audience")
                    : modalSection === "share"
                    ? t("actions.share")
                    : ""}
                </h3>
              </ModalHeader>
              <ModalBody>
                {modalSection === "author" && (
                  <ShortUserSummary user={localPoll.user} />
                )}
                {modalSection === "timeline" && (
                  <>
                    <p>
                      <span className="font-medium">{t("publishDate")}</span>:{" "}
                      {new Date(localPoll.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">{t("votingPeriod")}</span>:{" "}
                      {t.rich("postedBy", {
                        start_date: new Date(
                          localPoll.start_date
                        ).toLocaleDateString(),
                        end_date: new Date(
                          localPoll.end_date
                        ).toLocaleDateString(),
                      })}
                    </p>
                  </>
                )}
                {modalSection === "audience" && (
                  <>
                    <p>
                      <span className="font-medium">{t("ageRange")}</span>:{" "}
                      {t("ageRangeBetween", {
                        min: localPoll.audience.age_range?.min ?? "",
                        max:
                          localPoll.audience.age_range?.max ===
                          String(MAX_AUDIENCE_AGE)
                            ? t("ageRangeNoMax")
                            : localPoll.audience.age_range?.max ?? "",
                      })}
                    </p>
                    {[
                      {
                        label: t("gender"),
                        options: genders,
                        aud: strToArray(localPoll.audience.gender ?? "") ?? [],
                      },
                      {
                        label: t("hometown"),
                        options: provinces,
                        aud: strToArray(localPoll.audience.hometown ?? ""),
                      },
                      {
                        label: t("religinousAffiliation"),
                        options: religinousAffiliations,
                        aud: strToArray(
                          localPoll.audience.religious_affiliation ?? ""
                        ),
                      },
                      {
                        label: t("ethnicity"),
                        options: ethnicities,
                        aud: strToArray(localPoll.audience.ethnicity ?? ""),
                      },
                      {
                        label: t("country"),
                        options: countries,
                        aud: strToArray(localPoll.audience.country ?? ""),
                      },
                    ].map((audience, i) => {
                      return (
                        <p key={i}>
                          <span className="font-medium">
                            {audience.label}:{" "}
                          </span>
                          {(audience.aud ?? "")?.length === 0 ? (
                            t("noLimit")
                          ) : (
                            <>
                              {audience.aud
                                .map(
                                  (item) =>
                                    audience.options[
                                      item as keyof typeof audience.options
                                    ]
                                )
                                .join(", ")}
                            </>
                          )}
                        </p>
                      );
                    })}
                  </>
                )}
                {modalSection === "share" && (
                  <div className="grid grid-cols-2 gap-4 flex-wrap">
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
                <Button onPress={onClose} color="danger">{t("close")}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PollFullCard;
