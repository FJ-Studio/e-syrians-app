"use client";

import { verificationBadgeColors, verificationBadgePaths, type VerificationBadgeKind } from "@/lib/verification-badge";
import { Tooltip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function VerificationBadge({ kind }: { kind?: VerificationBadgeKind | null }) {
  const t = useTranslations("account.dashboard.overview.verificationBadge");
  const [isOpen, setIsOpen] = useState(false);
  if (!kind) return null;

  const label = t(kind);
  return (
    <Tooltip content={label} showArrow isDismissable isOpen={isOpen} onOpenChange={setIsOpen}>
      <button
        type="button"
        aria-label={label}
        onClick={() => setIsOpen(true)}
        className="focus-visible:outline-primary inline-grid size-6 shrink-0 cursor-help place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        <svg aria-hidden="true" className="size-5" viewBox="0 0 100 100">
          <path d={verificationBadgePaths[0]} fill={verificationBadgeColors[kind]} />
          <path d={verificationBadgePaths[1]} fill="#fff" />
        </svg>
      </button>
    </Tooltip>
  );
}
