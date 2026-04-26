"use client";

import { FeatureSort, FeatureStatus, featureSorts, featureStatuses } from "@/lib/types/feature-requests";
import { Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";

type Props = {
  sort: FeatureSort;
  status?: FeatureStatus;
};

/**
 * Sort is always bound — the default ("newest") is reflected in the URL
 * implicitly. Status is optional: a sentinel "all" key maps to clearing the
 * filter, which keeps the `Select` happy (it needs a non-empty key).
 */
const ALL = "all";

const Filters: FC<Props> = ({ sort, status }) => {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();
  const tStatus = useTranslations("feature_requests.statuses");
  const tSort = useTranslations("feature_requests.sort");
  const tFilters = useTranslations("feature_requests.filters");

  const setParam = (key: "sort" | "status", value: string | null): void => {
    const params = new URLSearchParams(sp.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
      <Select
        label={tFilters("sort")}
        size="sm"
        className="min-w-40"
        selectedKeys={[sort]}
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as FeatureSort | undefined;
          if (value) setParam("sort", value);
        }}
      >
        {featureSorts.map((s) => (
          <SelectItem key={s} textValue={tSort(s)}>
            {tSort(s)}
          </SelectItem>
        ))}
      </Select>
      <Select
        label={tFilters("status")}
        size="sm"
        className="min-w-40"
        selectedKeys={[status ?? ALL]}
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string | undefined;
          if (!value) return;
          setParam("status", value === ALL ? null : value);
        }}
      >
        {[
          <SelectItem key={ALL} textValue={tFilters("all_statuses")}>
            {tFilters("all_statuses")}
          </SelectItem>,
          ...featureStatuses.map((s) => (
            <SelectItem key={s} textValue={tStatus(s)}>
              {tStatus(s)}
            </SelectItem>
          )),
        ]}
      </Select>
    </div>
  );
};

export default Filters;
