import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { FC } from "react";

type Contributor = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
};

/**
 * GitHub's public "list contributors" endpoint. No auth required for public
 * repos; the unauthenticated rate limit (60/hr per IP) is more than enough
 * given we cache responses for an hour.
 */
const GITHUB_ORG = "FJ-Studio";
const API_REPO = "e-syrians-api";
const APP_REPO = "e-syrians-app";

const fetchContributors = async (repo: string): Promise<Contributor[]> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repo}/contributors?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
      // Revalidate once an hour — contributor lists barely change within a
      // single visitor session. On failure we fall through to an empty list.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as Contributor[];
    // Strip bot accounts (dependabot, renovate, github-actions[bot], etc.).
    return data.filter((c) => c.type !== "Bot" && !c.login.endsWith("[bot]"));
  } catch {
    return [];
  }
};

type ListProps = {
  heading: string;
  repoUrl: string;
  repoLinkLabel: string;
  empty: string;
  contributors: ReadonlyArray<Contributor>;
  contributionsLabel: (count: number) => string;
};

const ContributorRow: FC<{ contributor: Contributor; contributionsLabel: (count: number) => string }> = ({
  contributor: c,
  contributionsLabel,
}) => (
  <a
    href={c.html_url}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:bg-default-100 rounded-medium -mx-2 flex items-center gap-3 px-2 py-1.5 transition-colors"
  >
    <Image
      src={c.avatar_url}
      alt=""
      width={32}
      height={32}
      className="border-default-200 rounded-full border"
      unoptimized
    />
    <div className="min-w-0 flex-1">
      <p className="text-default-900 truncate text-sm font-medium">{c.login}</p>
      <p className="text-default-500 text-tiny">{contributionsLabel(c.contributions)}</p>
    </div>
  </a>
);

const ContributorList: FC<ListProps> = ({
  heading,
  repoUrl,
  repoLinkLabel,
  empty,
  contributors,
  contributionsLabel,
}) => (
  <div>
    <div className="mb-3 flex items-baseline justify-between gap-2">
      <h4 className="text-default-700 text-tiny font-semibold tracking-wider uppercase">{heading}</h4>
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-tiny font-medium hover:underline"
      >
        {repoLinkLabel}
      </a>
    </div>
    {contributors.length === 0 ? (
      <p className="text-default-500 text-sm">{empty}</p>
    ) : (
      <ul className="space-y-0.5">
        {contributors.map((c) => (
          <li key={c.id}>
            <ContributorRow contributor={c} contributionsLabel={contributionsLabel} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Sidebar card listing contributors pulled from the backend and frontend
 * repos. Each row shows avatar + GitHub handle + contribution count — no
 * tooltip needed, the info is inline. Server component — runs the fetch at
 * render time, caches via Next's ISR layer, falls back to empty on error.
 */
const Contributors: FC = async () => {
  const t = await getTranslations("feature_requests.contributors");
  const [backend, frontend] = await Promise.all([fetchContributors(API_REPO), fetchContributors(APP_REPO)]);

  if (backend.length === 0 && frontend.length === 0) {
    return null;
  }

  const contributionsLabel = (count: number): string => t("contributions", { count });

  return (
    <section className="border-default-200 bg-content1 rounded-large border p-6" aria-labelledby="contributors-heading">
      <h3 id="contributors-heading" className="text-default-900 text-lg font-semibold">
        {t("title")}
      </h3>
      <p className="text-default-500 mt-1 mb-5 text-sm">{t("subtitle")}</p>
      <div className="space-y-6">
        <ContributorList
          heading={t("backend")}
          repoUrl={`https://github.com/${GITHUB_ORG}/${API_REPO}`}
          repoLinkLabel={t("view_repo")}
          empty={t("empty")}
          contributors={backend}
          contributionsLabel={contributionsLabel}
        />
        <ContributorList
          heading={t("frontend")}
          repoUrl={`https://github.com/${GITHUB_ORG}/${APP_REPO}`}
          repoLinkLabel={t("view_repo")}
          empty={t("empty")}
          contributors={frontend}
          contributionsLabel={contributionsLabel}
        />
      </div>
    </section>
  );
};

export default Contributors;
