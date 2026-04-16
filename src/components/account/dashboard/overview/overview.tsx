"use client";

import { ESUser } from "@/lib/types/account";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Spinner,
} from "@heroui/react";
import chartBarIcon from "@iconify-icons/heroicons/chart-bar";
import checkBadgeIcon from "@iconify-icons/heroicons/check-badge";
import clipboardDocumentCheckIcon from "@iconify-icons/heroicons/clipboard-document-check";
import cog6ToothIcon from "@iconify-icons/heroicons/cog-6-tooth";
import plusCircleIcon from "@iconify-icons/heroicons/plus-circle";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecentPoll {
  id: string;
  question: string;
  votes_count: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

interface OverviewData {
  profile: ESUser | null;
  polls: { total: number; recent: RecentPoll[] };
  verifications: { received: number; given: number };
  profileCompleteness: {
    filled: number;
    total: number;
    percentage: number;
  };
}

// ---------------------------------------------------------------------------
// Overview component
// ---------------------------------------------------------------------------

const AccountOverview: FC = () => {
  const t = useTranslations("account.dashboard.overview");
  const { data: session, update: updateSession } = useSession();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/account/overview");
        if (res.ok) {
          const json = await res.json();
          if (json?.success) {
            setData(json.data);

            // Sync session if verification status changed on the backend
            const backendProfile = json.data?.profile;
            if (backendProfile && session?.user) {
              const sessionVerified = session.user.verified_at;
              const backendVerified = backendProfile.verified_at;
              if (sessionVerified !== backendVerified) {
                await updateSession({
                  verified_at: backendVerified,
                });
              }
            }
          }
        }
      } catch {
        // Handled via empty state
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <p className="text-default-500 mb-4">{t("error")}</p>
          <Button color="primary" onPress={() => window.location.reload()}>
            {t("retry")}
          </Button>
        </CardBody>
      </Card>
    );
  }

  const { profile, polls, verifications, profileCompleteness } = data;
  const isVerified = !!profile?.verified_at;

  return (
    <div className="space-y-6">
      {/* ---- Profile card ---- */}
      <Card>
        <CardBody>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar + name */}
            <Avatar
              src={profile?.avatar || undefined}
              name={`${profile?.name?.[0] ?? ""} ${profile?.surname?.[0] ?? ""}`}
              className="h-16 w-16 text-xl"
              isBordered
              color={isVerified ? "success" : "default"}
            />
            <div className="flex-1 text-center sm:text-start">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-semibold">
                  {profile?.name} {profile?.surname}
                </h2>
                {isVerified && <Icon icon={checkBadgeIcon} className="text-success size-5" />}
              </div>
              <p className="text-default-500 text-sm">{profile?.email}</p>
              <Chip size="sm" variant="flat" color={isVerified ? "success" : "warning"} className="mt-1">
                {isVerified ? t("verified") : t("unverified")}
              </Chip>
            </div>

            {/* Profile completeness ring */}
            <div className="flex flex-col items-center gap-1">
              <CircularProgress
                value={profileCompleteness.percentage}
                color={
                  profileCompleteness.percentage >= 80
                    ? "success"
                    : profileCompleteness.percentage >= 50
                      ? "warning"
                      : "danger"
                }
                showValueLabel
                size="lg"
                classNames={{
                  value: "text-xs font-semibold",
                }}
              />
              <span className="text-default-500 text-xs">{t("profileComplete")}</span>
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="justify-center gap-2 sm:justify-start">
          <Button
            as={Link}
            href="/account/settings"
            size="sm"
            variant="flat"
            startContent={<Icon icon={cog6ToothIcon} className="size-4" />}
          >
            {t("editProfile")}
          </Button>
        </CardFooter>
      </Card>

      {/* ---- Quick stats ---- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<Icon icon={chartBarIcon} className="text-primary size-5" />}
          label={t("stats.polls")}
          value={polls.total}
          href="/account/polls"
        />
        <StatCard
          icon={<Icon icon={clipboardDocumentCheckIcon} className="text-success size-5" />}
          label={t("stats.verificationsReceived")}
          value={verifications.received}
          href="/account/verifications"
        />
        <StatCard
          icon={<Icon icon={checkBadgeIcon} className="text-secondary size-5" />}
          label={t("stats.verificationsGiven")}
          value={verifications.given}
          href="/account/verifications"
        />
        <StatCard
          icon={<Icon icon={plusCircleIcon} className="text-warning size-5" />}
          label={t("stats.createPoll")}
          value="+"
          href="/account/polls/create"
        />
      </div>

      {/* ---- Recent polls ---- */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{t("recentPolls.title")}</h3>
          <Button as={Link} href="/account/polls" size="sm" variant="light" color="primary">
            {t("recentPolls.viewAll")}
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          {polls.recent.length === 0 ? (
            <div className="space-y-3 py-6 text-center">
              <p className="text-default-400">{t("recentPolls.empty")}</p>
              <Button
                as={Link}
                href="/account/polls/create"
                color="primary"
                size="sm"
                startContent={<Icon icon={plusCircleIcon} className="size-4" />}
              >
                {t("recentPolls.create")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {polls.recent.map((poll) => (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="rounded-medium hover:bg-default-100 flex items-center justify-between p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate font-medium">{poll.question}</p>
                    <p className="text-default-400 text-xs">
                      {new Date(poll.start_date).toLocaleDateString()} – {new Date(poll.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ms-3 flex shrink-0 items-center gap-2">
                    <Chip size="sm" variant="flat" color={poll.active ? "success" : "default"}>
                      {poll.active ? t("recentPolls.active") : t("recentPolls.inactive")}
                    </Chip>
                    <span className="text-default-500 text-sm">
                      {poll.votes_count} {t("recentPolls.votes")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Coming soon features can be added here later */}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Card as={Link} href={href} isPressable className="transition-transform hover:scale-[1.02]">
      <CardBody className="flex flex-row items-center gap-3 p-4">
        {icon}
        <div className="flex flex-col items-start">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-default-500 text-xs">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default AccountOverview;
