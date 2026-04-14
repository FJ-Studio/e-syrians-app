import { FeatureRequest, FeatureSort, FeatureStatus } from "@/lib/types/feature-requests";
import { Spacer } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import FeatureCard from "./cards/feature-card";
import FeatureRequestsEmptyState from "./empty-state";
import Filters from "./filters";
import FeatureRequestsPagination from "./pagination";

type Props = {
  features: Array<FeatureRequest>;
  current_page: number;
  last_page: number;
  sort: FeatureSort;
  status?: FeatureStatus;
};

const FeatureRequests: FC<Props> = ({ features, current_page, last_page, sort, status }) => {
  const t = useTranslations("feature_requests");
  return (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">{t("title")}</h1>
          <p className="mt-1 max-w-prose">{t("description")}</p>
        </div>
        <Filters sort={sort} status={status} />
      </div>
      <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
      <Spacer y={4} />
      {features.length > 0 ? (
        <FeatureRequestsPagination page={current_page} last_page={last_page} />
      ) : (
        <FeatureRequestsEmptyState />
      )}
      <Spacer y={4} />
    </>
  );
};

export default FeatureRequests;
