"use client";

import { Button } from "@heroui/react";
import plusIcon from "@iconify-icons/heroicons/plus";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";

/**
 * Rendered when the list is empty. Shows the "Suggest a feature" CTA to
 * signed-in users. Unauthenticated visitors get a quieter nudge (the copy
 * alone) — they'll hit the login gate if they click through elsewhere.
 */
const FeatureRequestsEmptyState: FC = () => {
  const t = useTranslations("feature_requests");
  const { status } = useSession();
  return (
    <div className="my-10 flex flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-lg font-medium">{t("empty.title")}</p>
        <p className="text-default-500">{t("empty.description")}</p>
      </div>
      {status === "authenticated" && (
        <Button
          as={Link}
          href="/feature-requests/new"
          color="primary"
          startContent={<Icon icon={plusIcon} className="h-4 w-4" />}
        >
          {t("create.cta")}
        </Button>
      )}
    </div>
  );
};

export default FeatureRequestsEmptyState;
