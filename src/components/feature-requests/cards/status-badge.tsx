"use client";

import { FeatureStatus } from "@/lib/types/feature-requests";
import { Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type Props = {
  status: FeatureStatus;
};

/**
 * Color mapping. HeroUI's Chip color tokens line up roughly with the
 * "coldest-to-hottest" progression through the pipeline.
 */
const statusColor: Record<FeatureStatus, "default" | "primary" | "warning" | "success"> = {
  idea: "default",
  in_development: "primary",
  in_testing: "warning",
  shipped: "success",
};

const StatusBadge: FC<Props> = ({ status }) => {
  const t = useTranslations("feature_requests.statuses");
  return (
    <Chip size="sm" variant="flat" color={statusColor[status]}>
      {t(status)}
    </Chip>
  );
};

export default StatusBadge;
