import { proxyGet } from "@/lib/api-route";

// GET /api/account/deletion/status → GET /users/account/deletion-status
//
// This route sits in the "allowed during pending deletion" group on the
// backend (see routes/api.php), so it stays reachable even while the
// EnsureAccountNotPendingDeletion middleware blocks every other
// authenticated route. The web dashboard reads this to render the
// pending-deletion banner without hitting /me and getting a 403.
export const GET = proxyGet({
  endpoint: "/users/account/deletion-status",
  errorMessage: "Failed to load account deletion status",
});
