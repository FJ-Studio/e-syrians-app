"use client";

import { useVerificationSummary } from "@/hooks/use-identity-verification";
import { Link } from "@/i18n/routing";
import { entryAction, verificationCard, verificationCopy, verificationState } from "@/lib/identity-verification";
import { liveVerificationEnabled, verificationPage } from "@/lib/identity-verification-mode";
import chevronRight from "@iconify-icons/heroicons/chevron-right";
import identification from "@iconify-icons/heroicons/identification";
import { Icon } from "@iconify/react";
import { useLocale } from "next-intl";

const statusColors = {
  neutral: "text-default-600",
  brand: "text-primary",
  progress: "text-primary",
  success: "text-success-700",
  warning: "text-warning-700",
};

export default function IdentityVerificationEntry({ userId }: { userId?: string }) {
  const copy = verificationCopy(useLocale(), liveVerificationEnabled());
  const { data, error } = useVerificationSummary(userId);
  if (!data || [401, 403, 404].includes(error?.status ?? 0)) return null;
  const state = verificationState(data);
  const card = verificationCard(data, copy);
  const hasStatus = !!state.current && state.current.status !== "available";
  const status = hasStatus ? card.status : copy.test;
  const balance = state.balance > 0 ? copy.balance(state.balance) : null;

  return (
    <Link
      href={verificationPage()}
      className="group border-default-200 hover:bg-default-100/60 focus-visible:outline-primary grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-t px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-5"
    >
      <span className="bg-default-100 text-primary row-span-2 grid size-9 place-items-center rounded-lg sm:row-span-1">
        <Icon icon={identification} className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{copy.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
          <span className={hasStatus ? statusColors[card.tone] : statusColors.neutral}>{status}</span>
          {balance && (
            <>
              <span className="text-default-400" aria-hidden>
                ·
              </span>
              <span className="text-default-600 tabular-nums">{balance}</span>
            </>
          )}
        </span>
      </span>
      <span className="text-primary col-start-2 flex items-center gap-1 text-sm font-medium group-hover:underline sm:col-start-3 sm:row-start-1">
        {entryAction(state, copy)}
        <Icon icon={chevronRight} className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  );
}
