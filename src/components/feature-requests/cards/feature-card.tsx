"use client";

import { FeatureRequest } from "@/lib/types/feature-requests";
import { Avatar, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import chatBubbleLeftEllipsisIcon from "@iconify-icons/heroicons/chat-bubble-left-ellipsis";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";
import StatusBadge from "./status-badge";
import Timeline from "./timeline";
import VoteWidget from "./vote-widget";

type Props = {
  feature: FeatureRequest;
};

/** Clamp the description so cards stay uniform in a grid. */
const PREVIEW_LEN = 180;

const FeatureCard: FC<Props> = ({ feature }) => {
  const t = useTranslations("feature_requests");
  const preview =
    feature.description.length > PREVIEW_LEN ? `${feature.description.slice(0, PREVIEW_LEN)}…` : feature.description;

  return (
    <Card className="p-3">
      <CardHeader className="flex items-center justify-between gap-2">
        <Link className="flex items-center gap-2" href={`/feature-requests/${feature.id}`}>
          <Avatar
            src={feature.user.avatar}
            className="min-h-10 min-w-10"
            alt={`${feature.user.name ?? ""} ${feature.user.surname ?? ""}`}
          />
          <div className="flex flex-col">
            <span className="text-default-500 text-tiny font-normal">
              {new Date(feature.created_at).toLocaleDateString()}
            </span>
            <p className="font-medium">{`${feature.user.name ?? ""} ${feature.user.surname ?? ""}`}</p>
          </div>
        </Link>
        <StatusBadge status={feature.status} />
      </CardHeader>
      <CardBody className="items-start space-y-3 text-start">
        <Link href={`/feature-requests/${feature.id}`} className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 hover:underline">{feature.title}</h3>
        </Link>
        <p className="text-default-700 text-sm">{preview}</p>
        <Timeline timeline={feature.timeline} />
      </CardBody>
      <CardFooter className="flex items-center justify-between">
        <VoteWidget
          featureRequestId={feature.id}
          ups_count={feature.ups_count}
          downs_count={feature.downs_count}
          has_upvoted={feature.has_upvoted}
          has_downvoted={feature.has_downvoted}
        />
        {typeof feature.notes_count === "number" && feature.notes_count > 0 && (
          <span className="text-default-500 inline-flex items-center gap-1 text-sm">
            <Icon icon={chatBubbleLeftEllipsisIcon} className="h-4 w-4" />
            {t("notes.count", { count: feature.notes_count })}
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
