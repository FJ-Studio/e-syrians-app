"use client";

import type { VerificationCreditHistory, VerificationSummary } from "@/lib/identity-verification";
import { verificationEnabled } from "@/lib/identity-verification-mode";
import useSWR from "swr";

const endpoint = "/api/account/identity-sandbox";

export class VerificationRequestError extends Error {
  constructor(readonly status: number) {
    super("Verification request failed");
  }
}

export async function requestVerification<T>(path = "", body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${endpoint}${path}`, {
    cache: "no-store",
    ...(body && { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new VerificationRequestError(res.status);
  const { data } = (await res.json()) as { data: T };
  return data;
}

export function useVerificationCreditHistory(userId: string, page: number, visible: boolean) {
  const path = `/history?page=${page}`;
  return useSWR<VerificationCreditHistory, VerificationRequestError>(
    verificationEnabled() && visible ? [`${endpoint}${path}`, userId] : null,
    () => requestVerification<VerificationCreditHistory>(path),
    { shouldRetryOnError: false },
  );
}

export function useVerificationSummary(userId?: string) {
  return useSWR<VerificationSummary, VerificationRequestError>(
    verificationEnabled() && userId ? [endpoint, userId] : null,
    () => requestVerification<VerificationSummary>(),
    { shouldRetryOnError: false },
  );
}
