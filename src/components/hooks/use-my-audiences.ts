"use client";
import { Audience } from "@/lib/types/audience";
import { useEffect, useState } from "react";

interface UseMyAudiencesState {
  audiences: Audience[];
  loading: boolean;
  /** True when the initial fetch resolved successfully but returned no rows. */
  isEmpty: boolean;
  error: string | null;
  refetch: () => void;
  /**
   * Prepend an audience to the local list without a network round-trip.
   * Used by callers that just created an audience via the inline modal
   * and want the picker to reflect it immediately — instead of
   * waiting for the next refetch to see the new row and flashing
   * "loading" in between.
   */
  pushAudience: (audience: Audience) => void;
}

/**
 * Client hook — fetches the signed-in user's audiences for use in
 * dropdowns / autocompletes. Pulls a single large page (100 rows) so
 * we don't have to build pagination into the poll form. Users cap out
 * at low tens of audiences in practice; a second page would be a
 * signal to add proper pagination here.
 */
export default function useMyAudiences(): UseMyAudiencesState {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/account/audiences?per_page=100", {
          headers: { Accept: "application/json" },
        });
        const body = await res.json();
        if (cancelled) return;
        if (res.ok && body?.success) {
          setAudiences((body.data?.audiences as Audience[]) ?? []);
        } else {
          setError((body?.messages?.[0] as string) ?? "load_failed");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "load_failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  return {
    audiences,
    loading,
    isEmpty: !loading && error === null && audiences.length === 0,
    error,
    refetch: () => setFetchKey((k) => k + 1),
    // Optimistic prepend + dedupe by uuid so an accidental
    // double-push doesn't produce two rows in the picker.
    pushAudience: (audience: Audience) =>
      setAudiences((prev) => [audience, ...prev.filter((a) => a.uuid !== audience.uuid)]),
  };
}
