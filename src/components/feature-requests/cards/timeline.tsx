"use client";

import { FeatureTimeline } from "@/lib/types/feature-requests";
import { Tooltip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type Props = {
  timeline: FeatureTimeline;
};

type StageKey = "created_at" | "coded_at" | "tested_at" | "deployed_at";

const stages: ReadonlyArray<StageKey> = ["created_at", "coded_at", "tested_at", "deployed_at"];

/**
 * Four-dot horizontal timeline — Idea → Coded → Tested → Shipped. Dots are
 * solid + primary-colored when their timestamp is set; empty + muted otherwise.
 * Tooltip shows the localized date. Purely a server-renderable component —
 * takes the timeline object straight from the API resource.
 */
const Timeline: FC<Props> = ({ timeline }) => {
  const t = useTranslations("feature_requests.timeline");

  return (
    <div className="flex items-center gap-2">
      {stages.map((key, index) => {
        const stamp = timeline[key];
        const isActive = stamp !== null && stamp !== undefined;
        const label = stamp ? new Date(stamp).toLocaleDateString() : t("not_yet");
        return (
          <div key={key} className="flex items-center gap-2">
            <Tooltip content={`${t(key)} — ${label}`}>
              <span
                aria-label={`${t(key)} — ${label}`}
                className={`inline-block h-3 w-3 rounded-full border ${
                  isActive ? "bg-primary border-primary" : "border-default-300 bg-default-100"
                }`}
              />
            </Tooltip>
            {index < stages.length - 1 && (
              <span className={`h-0.5 w-6 ${timeline[stages[index + 1]] ? "bg-primary" : "bg-default-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
