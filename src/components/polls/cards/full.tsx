"use client";
import { Poll } from "@/lib/types/polls";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CheckboxGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import PollOptionRow from "./poll-option-row";
import Link from "next/link";
import canAnswerPoll from "@/lib/can-answer-poll";
import { useSession } from "next-auth/react";

type Props = {
  poll: Poll;
};

const PollFullCard: FC<Props> = ({ poll }) => {
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);

  const { user } = poll;
  const t = useTranslations("polls");
  const session = useSession();
  const canAnswer = canAnswerPoll(poll, session.data?.user);
  return (
    <Card>
      <CardHeader className="flex items-start gap-1.5">
        <Avatar
          src={user.avatar}
          className="min-h-10 min-w-10"
          alt={`${user.name} ${user.surname}`}
          title={`${user.name} ${user.surname}`}
        />
        <Link className="font-medium w-full" href={`/polls/${poll.id}`}>
          {poll.question}
        </Link>
        <Popover>
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
        </Popover>
      </CardHeader>
      <CardBody className="space-y-2">
        <CheckboxGroup
          classNames={{
            base: "w-full",
          }}
          value={selectedOptions}
          onChange={setSelectedOptions}
        >
          {poll.options.map((option) => (
            <PollOptionRow
              key={option.id}
              option={option.option_text}
              value={option.id}
            />
          ))}
        </CheckboxGroup>
      </CardBody>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            startContent={<HandThumbUpIcon className="w-6 h-6" />}
          >
            {poll.ups_count}
          </Button>
          <Button
            size="sm"
            startContent={<HandThumbDownIcon className="w-6 h-6" />}
          >
            {poll.downs_count}
          </Button>
        </div>
        <Button
          size="sm"
          color="primary"
          isDisabled={!selectedOptions.length || !canAnswer[0]}
        >
          {t("vote")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollFullCard;
