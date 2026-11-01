export const NOTIFICATION_CATEGORIES = [
  "verifications",
  "account_status",
  "poll_invitations",
  "poll_results",
  "feature_requests",
  "announcements",
  "security",
] as const;
export const NOTIFICATION_CHANNELS = ["in_app", "push", "email"] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type NotificationPreferences = Record<NotificationCategory, { in_app: boolean; push: boolean; email?: boolean }>;

/** Never display guessed consent when the API is unavailable or has an older contract. */
export function parseNotificationPreferences(value: unknown): NotificationPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid notification preferences");
  const data = value as Record<string, unknown>;
  const result = {} as NotificationPreferences;
  for (const category of NOTIFICATION_CATEGORIES) {
    const entry = data[category];
    if (
      !entry ||
      typeof entry !== "object" ||
      !("in_app" in entry) ||
      !("push" in entry) ||
      typeof entry.in_app !== "boolean" ||
      typeof entry.push !== "boolean"
    ) {
      throw new Error("Invalid notification preferences");
    }
    result[category] = { in_app: entry.in_app, push: entry.push };
    if ("email" in entry) {
      if (!["verifications", "account_status"].includes(category) || typeof entry.email !== "boolean") {
        throw new Error("Invalid notification preferences");
      }
      result[category].email = entry.email;
    }
  }
  return result;
}
