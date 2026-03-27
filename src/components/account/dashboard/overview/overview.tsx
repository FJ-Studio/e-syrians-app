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
import {
  ChartBarIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ScaleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
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
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/account/overview");
        if (res.ok) {
          const json = await res.json();
          if (json?.success) setData(json.data);
        }
      } catch {
        // Handled via empty state
      } finally {
        setLoading(false);
      }
    };
    load();
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
          <Button
            color="primary"
            onPress={() => window.location.reload()}
          >
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar + name */}
            <Avatar
              src={profile?.avatar || undefined}
              name={`${profile?.name?.[0] ?? ""} ${profile?.surname?.[0] ?? ""}`}
              className="w-16 h-16 text-xl"
              isBordered
              color={isVerified ? "success" : "default"}
            />
            <div className="flex-1 text-center sm:text-start">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-semibold">
                  {profile?.name} {profile?.surname}
                </h2>
                {isVerified && (
                  <CheckBadgeIcon className="size-5 text-success" />
                )}
              </div>
              <p className="text-default-500 text-sm">{profile?.email}</p>
              <Chip
                size="sm"
                variant="flat"
                color={isVerified ? "success" : "warning"}
                className="mt-1"
              >
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
              <span className="text-xs text-default-500">
                {t("profileComplete")}
              </span>
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="gap-2 justify-center sm:justify-start">
          <Button
            as={Link}
            href="/account/settings"
            size="sm"
            variant="flat"
            startContent={<Cog6ToothIcon className="size-4" />}
          >
            {t("editProfile")}
          </Button>
        </CardFooter>
      </Card>

      {/* ---- Quick stats ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<ChartBarIcon className="size-5 text-primary" />}
          label={t("stats.polls")}
          value={polls.total}
          href="/account/polls"
        />
        <StatCard
          icon={<ClipboardDocumentCheckIcon className="size-5 text-success" />}
          label={t("stats.verificationsReceived")}
          value={verifications.received}
          href="/account/verifications"
        />
        <StatCard
          icon={<CheckBadgeIcon className="size-5 text-secondary" />}
          label={t("stats.verificationsGiven")}
          value={verifications.given}
          href="/account/verifications"
        />
        <StatCard
          icon={<PlusCircleIcon className="size-5 text-warning" />}
          label={t("stats.createPoll")}
          value="+"
          href="/account/polls/create"
        />
      </div>

      {/* ---- Recent polls ---- */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{t("recentPolls.title")}</h3>
          <Button
            as={Link}
            href="/account/polls"
            size="sm"
            variant="light"
            color="primary"
          >
            {t("recentPolls.viewAll")}
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          {polls.recent.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-default-400">{t("recentPolls.empty")}</p>
              <Button
                as={Link}
                href="/account/polls/create"
                color="primary"
                size="sm"
                startContent={<PlusCircleIcon className="size-4" />}
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
                  className="flex items-center justify-between p-3 rounded-medium hover:bg-default-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{poll.question}</p>
                    <p className="text-xs text-default-400">
                      {new Date(poll.start_date).toLocaleDateString()} –{" "}
                      {new Date(poll.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ms-3">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={poll.active ? "success" : "default"}
                    >
                      {poll.active
                        ? t("recentPolls.active")
                        : t("recentPolls.inactive")}
                    </Chip>
                    <span className="text-sm text-default-500">
                      {poll.votes_count} {t("recentPolls.votes")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ---- Coming soon features ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ComingSoonCard
          icon={<ScaleIcon className="size-6 text-danger" />}
          title={t("comingSoon.violations.title")}
          description={t("comingSoon.violations.description")}
        />
        <ComingSoonCard
          icon={<WalletIcon className="size-6 text-warning" />}
          title={t("comingSoon.wallet.title")}
          description={t("comingSoon.wallet.description")}
        />
      </div>
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
    <Card
      as={Link}
      href={href}
      isPressable
      className="hover:scale-[1.02] transition-transform"
    >
      <CardBody className="flex flex-row items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-default-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function ComingSoonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-2 border-default-200 bg-default-50">
      <CardBody className="flex flex-row items-start gap-3 p-4">
        {icon}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{title}</p>
            <Chip size="sm" variant="flat" color="default">
              Coming soon
            </Chip>
          </div>
          <p className="text-xs text-default-400 mt-1">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default AccountOverview;
