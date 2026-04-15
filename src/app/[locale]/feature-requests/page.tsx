import FeatureRequests from "@/components/feature-requests/feature-requests";
import { getFeatureRequests } from "@/lib/api/requests";
import { FeatureSort, FeatureStatus, featureSorts, featureStatuses } from "@/lib/types/feature-requests";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Narrow an unknown searchParam value to a valid FeatureSort, falling back to
 * "newest". Keeps the server component from passing junk down to the API.
 */
function coerceSort(raw: string | string[] | undefined): FeatureSort {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (featureSorts as readonly string[]).includes(value ?? "") ? (value as FeatureSort) : "newest";
}

function coerceStatus(raw: string | string[] | undefined): FeatureStatus | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (featureStatuses as readonly string[]).includes(value ?? "") ? (value as FeatureStatus) : undefined;
}

export default async function FeatureRequestsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const page = (searchParams.page as string) || "1";
  const sort = coerceSort(searchParams.sort);
  const status = coerceStatus(searchParams.status);

  const result = await getFeatureRequests(page, sort, status);
  const { feature_requests = [], current_page = 1, last_page = 1 } = result?.data ?? {};

  return (
    <FeatureRequests
      features={feature_requests}
      current_page={current_page}
      last_page={last_page}
      sort={sort}
      status={status}
    />
  );
}
