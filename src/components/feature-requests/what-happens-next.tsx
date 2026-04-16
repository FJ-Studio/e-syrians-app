"use client";

import beakerIcon from "@iconify-icons/heroicons/beaker";
import handThumbUpIcon from "@iconify-icons/heroicons/hand-thumb-up";
import lightBulbIcon from "@iconify-icons/heroicons/light-bulb";
import rocketLaunchIcon from "@iconify-icons/heroicons/rocket-launch";
import { Icon, IconifyIcon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type Step = {
  key: "submit" | "vote" | "pick_up" | "ship";
  icon: IconifyIcon;
};

const steps: ReadonlyArray<Step> = [
  { key: "submit", icon: lightBulbIcon },
  { key: "vote", icon: handThumbUpIcon },
  { key: "pick_up", icon: beakerIcon },
  { key: "ship", icon: rocketLaunchIcon },
];

/**
 * Vertical "timeline rail" explaining the workflow from idea → shipped. Lives
 * in the sidebar of the create page, so it's a 1-column layout connected by
 * a thin vertical line that threads through the numbered circles.
 */
const WhatHappensNext: FC = () => {
  const t = useTranslations("feature_requests.what_happens_next");

  return (
    <section
      className="border-default-200 bg-content1 rounded-large border p-6"
      aria-labelledby="what-happens-next-heading"
    >
      <h3 id="what-happens-next-heading" className="text-default-900 text-lg font-semibold">
        {t("title")}
      </h3>
      <p className="text-default-500 mt-1 mb-5 text-sm">{t("subtitle")}</p>
      <div className="relative">
        <span aria-hidden="true" className="bg-default-200 absolute start-4 top-4 bottom-4 w-px" />
        <ol className="relative space-y-5">
          {steps.map(({ key, icon }, index) => (
            <li key={key} className="relative flex gap-3">
              <span className="bg-primary/10 text-primary relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon icon={icon} className="text-primary h-4 w-4 shrink-0" />
                  <p className="text-default-900 font-medium">{t(`steps.${key}.title`)}</p>
                </div>
                <p className="text-default-600 mt-1 text-sm">{t(`steps.${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default WhatHappensNext;
