import DeletionPending from "@/components/account/deletion-pending/deletion-pending";

/**
 * Server-component shell for the deletion-pending route. The account
 * dashboard's `<DashboardLayout>` (mounted by
 * `src/app/[locale]/account/layout.tsx`) is inherited from the parent
 * segment. We intentionally keep the same chrome — the redirect guard
 * in the dashboard layout is what enforces that this is the only
 * account page a pending-deletion user can see.
 *
 * All logic lives in the client component; this file exists so the
 * route resolves under the `[locale]` segment.
 */
export default function DeletionPendingPage() {
  return <DeletionPending />;
}
