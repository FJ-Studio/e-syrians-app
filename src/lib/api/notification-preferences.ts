import {
  parseNotificationPreferences,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationPreferences,
} from "@/lib/notification-preferences";

const ENDPOINT = "/api/account/settings/notifications";

async function requestPreferences(userUuid: string, options: RequestInit): Promise<NotificationPreferences> {
  const response = await fetch(ENDPOINT, {
    ...options,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json", "Content-Type": "application/json", "X-Account-UUID": userUuid },
  });
  const json = await response.json();
  if (!response.ok || json?.success !== true) throw new Error("Notification preferences request failed");
  return parseNotificationPreferences(json.data?.categories);
}

export function readNotificationPreferences(userUuid: string): Promise<NotificationPreferences> {
  return requestPreferences(userUuid, { method: "GET" });
}

export function saveNotificationPreference(
  userUuid: string,
  category: NotificationCategory,
  channel: NotificationChannel,
  enabled: boolean,
): Promise<NotificationPreferences> {
  return requestPreferences(userUuid, {
    method: "PATCH",
    body: JSON.stringify({ user_uuid: userUuid, category, channel, enabled }),
  });
}
