"use client";

import {
  creditHistoryDays,
  creditHistoryDelta,
  type verificationCopy,
  type VerificationCreditHistory,
} from "@/lib/identity-verification";
import { Button } from "@heroui/react";
import arrowUpTray from "@iconify-icons/heroicons/arrow-up-tray";
import clock from "@iconify-icons/heroicons/clock";
import creditCard from "@iconify-icons/heroicons/credit-card";
import gift from "@iconify-icons/heroicons/gift";
import shieldCheck from "@iconify-icons/heroicons/shield-check";
import ticket from "@iconify-icons/heroicons/ticket";
import { Icon } from "@iconify/react";

const icons = new Map<string, typeof ticket>([
  ["purchased", creditCard],
  ["gift_received", gift],
  ["gift_sent", arrowUpTray],
  ["admin_granted", shieldCheck],
  ["claimed", ticket],
]);

type Props = {
  copy: ReturnType<typeof verificationCopy>;
  locale: string;
  history?: VerificationCreditHistory;
  loading: boolean;
  failed: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

export default function CreditHistory({ copy, locale, history, loading, failed, onPageChange, onRetry }: Props) {
  const days = history ? creditHistoryDays(history.items, locale) : [];
  const showEntries = !loading && !failed && history;

  return (
    <section
      aria-labelledby="verification-credit-history"
      className="border-default-200 bg-content1 overflow-hidden rounded-xl border"
    >
      <header className="px-4 py-4 sm:px-5">
        <h2 id="verification-credit-history" className="text-lg font-semibold">
          {copy.historyTitle}
        </h2>
        <p className="text-default-600 mt-0.5 text-sm">{copy.historyNote}</p>
      </header>
      {loading && (
        <p role="status" className="border-default-200 text-default-600 border-t px-4 py-5 text-sm sm:px-5">
          {copy.historyLoading}
        </p>
      )}
      {!loading && failed && (
        <div className="border-default-200 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 sm:px-5">
          <p role="alert" className="text-default-600 text-sm">
            {copy.historyFailed}
          </p>
          <Button size="sm" variant="light" color="primary" onPress={onRetry}>
            {copy.retry}
          </Button>
        </div>
      )}
      {showEntries &&
        (days.length ? (
          days.map((day) => (
            <div key={day.items[0].id}>
              <h3 className="bg-default-100/70 text-default-600 px-4 py-2 text-xs font-semibold tabular-nums sm:px-5">
                {day.date}
              </h3>
              <ul className="divide-default-200 divide-y px-4 sm:px-5">
                {day.items.map((item) => {
                  const delta = creditHistoryDelta(item.event);
                  const change = delta ? copy.historyChange(delta) : null;
                  return (
                    <li key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                      <span className="bg-default-100 text-default-600 grid size-9 place-items-center rounded-lg">
                        <Icon icon={icons.get(item.event) ?? clock} className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div className="grid min-w-0 gap-0.5">
                        <span className="text-sm font-medium">{copy.historyEvent(item.event)}</span>
                        <time dateTime={item.occurred_at} className="text-default-600 text-xs tabular-nums">
                          {item.time}
                        </time>
                      </div>
                      {change && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${delta > 0 ? "bg-success/10 text-success-700" : "bg-default-100 text-default-700"}`}
                        >
                          <bdi dir="ltr" aria-hidden="true">
                            {change.value}
                          </bdi>
                          <span className="sr-only">{change.label}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="border-default-200 text-default-600 flex items-center gap-3 border-t px-4 py-5 text-sm sm:px-5">
            <Icon icon={clock} className="size-5 shrink-0" aria-hidden="true" />
            <p>{copy.historyEmpty}</p>
          </div>
        ))}
      {showEntries && history.last_page > 1 && (
        <div className="border-default-200 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 sm:px-5">
          <Button
            size="sm"
            variant="bordered"
            isDisabled={history.page <= 1}
            onPress={() => onPageChange(history.page - 1)}
          >
            {copy.previousPage}
          </Button>
          <span className="text-default-600 text-xs tabular-nums">
            {copy.historyPage(history.page, history.last_page)}
          </span>
          <Button
            size="sm"
            variant="bordered"
            isDisabled={history.page >= history.last_page}
            onPress={() => onPageChange(history.page + 1)}
          >
            {copy.nextPage}
          </Button>
        </div>
      )}
    </section>
  );
}
