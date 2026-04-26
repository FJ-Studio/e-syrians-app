"use client";

import { Link } from "@/i18n/routing";
import { FeatureRequest } from "@/lib/types/feature-requests";
import { Avatar, Card, CardBody, CardFooter, CardHeader, Divider } from "@heroui/react";
import ArrowLongLeft from "@iconify-icons/heroicons/arrow-long-left";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import StatusBadge from "./cards/status-badge";
import Timeline from "./cards/timeline";
import VoteWidget from "./cards/vote-widget";

type Props = {
  feature: FeatureRequest;
};

const SingleFeatureRequest: FC<Props> = ({ feature }) => {
  const t = useTranslations("feature_requests");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/feature-requests" className="text-primary inline-flex items-center gap-2 text-sm hover:underline">
        <Icon icon={ArrowLongLeft} className="text-primary h-6 w-6 rtl:rotate-180" /> {t("back_to_list")}
      </Link>

      <Card className="p-3">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
          </div>
          <StatusBadge status={feature.status} />
        </CardHeader>
        <CardBody className="items-start space-y-4 text-start">
          <h1 className="text-default-800 text-2xl font-semibold">{feature.title}</h1>
          <p className="text-base leading-relaxed whitespace-pre-line">{feature.description}</p>
          <Divider />
          <div className="w-full space-y-2">
            <p className="text-default-500 text-sm font-medium">{t("timeline.heading")}</p>
            <Timeline timeline={feature.timeline} />
          </div>
        </CardBody>
        <CardFooter className="flex items-center justify-between">
          <VoteWidget
            featureRequestId={feature.id}
            ups_count={feature.ups_count}
            downs_count={feature.downs_count}
            has_upvoted={feature.has_upvoted}
            has_downvoted={feature.has_downvoted}
            size="md"
          />
          <span className="text-default-500 text-sm">{t("score", { score: feature.score })}</span>
        </CardFooter>
      </Card>

      {/* Notes section placeholder — populated by Step 7 once the API ships them. */}
      {feature.notes && feature.notes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t("notes.title")}</h2>
          {feature.notes.map((note) => (
            <Card key={note.id} className="p-3">
              <CardHeader className="flex items-center gap-2">
                <Avatar
                  src={note.author.avatar}
                  className="min-h-8 min-w-8"
                  alt={`${note.author.name ?? ""} ${note.author.surname ?? ""}`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{`${note.author.name ?? ""} ${note.author.surname ?? ""}`}</span>
                  <span className="text-default-500 text-tiny">
                    {new Date(note.created_at).toLocaleString()}
                    {note.was_edited && ` · ${t("notes.edited")}`}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-line">{note.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleFeatureRequest;
