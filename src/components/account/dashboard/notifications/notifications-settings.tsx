"use client";

import { readNotificationPreferences, saveNotificationPreference } from "@/lib/api/notification-preferences";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationPreferences,
} from "@/lib/notification-preferences";
import { Button, Card, CardBody, CardHeader, Spinner, Switch } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function NotificationsSettings() {
  const { data: session } = useSession();
  const userUuid = session?.user?.uuid;
  // Remount on account changes: old requests cannot update the next account's UI.
  return <NotificationPreferencesForAccount key={userUuid ?? "signed-out"} userUuid={userUuid} />;
}

export function NotificationPreferencesForAccount({ userUuid }: { userUuid?: string }) {
  const t = useTranslations("notificationPreferences");
  const mounted = useRef(false);
  const lock = useRef(false);
  const [saving, setSaving] = useState<string | null>(null);
  const busy = saving !== null;
  const { data, error, isLoading, isValidating, mutate } = useSWR<NotificationPreferences>(
    userUuid ? ["notification-preferences", userUuid] : null,
    () => readNotificationPreferences(userUuid!),
    { keepPreviousData: false, revalidateOnFocus: true, shouldRetryOnError: false },
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const toggle = async (category: NotificationCategory, channel: NotificationChannel, enabled: boolean) => {
    if (!userUuid || !data || error || lock.current) return;
    lock.current = true;
    setSaving(`${category}.${channel}`);
    try {
      const next = await saveNotificationPreference(userUuid, category, channel, enabled);
      if (!mounted.current) return;
      await mutate(next, { revalidate: false });
      if (mounted.current) toast.success(t("saved"));
    } catch {
      if (mounted.current) {
        toast.error(t("saveError"));
        void mutate();
      }
    } finally {
      lock.current = false;
      if (mounted.current) setSaving(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
        <p className="text-default-500 text-sm">{t("description")}</p>
      </CardHeader>
      <CardBody className="gap-6">
        <p className="text-default-500 text-sm">{t("pushNote")}</p>
        <p className="text-default-500 text-sm">{t("emailNote")}</p>
        {(!userUuid || isLoading) && (
          <div role="status" className="flex items-center gap-3">
            <Spinner size="sm" />
            <span>{t("loading")}</span>
          </div>
        )}
        {error && (
          <div role="alert" className="space-y-3">
            <p className="text-danger">{t("loadError")}</p>
            <Button
              variant="bordered"
              isLoading={isValidating}
              onPress={() => {
                void mutate();
              }}
            >
              {t("retry")}
            </Button>
          </div>
        )}
        {NOTIFICATION_CATEGORIES.map((category) => (
          <section key={category} className="space-y-3" aria-label={t(`categories.${category}.title`)}>
            <div>
              <h4 className="text-default-700 font-medium">{t(`categories.${category}.title`)}</h4>
              <p className="text-default-500 text-sm">{t(`categories.${category}.body`)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-8">
              {NOTIFICATION_CHANNELS.filter(
                (channel) => channel !== "email" || typeof data?.[category].email === "boolean",
              ).map((channel) => (
                <div key={channel} className="flex min-h-11 items-center justify-between gap-3">
                  <span className="text-default-600 text-sm">{t(`channels.${channel}`)}</span>
                  <div className="flex items-center gap-2">
                    {saving === `${category}.${channel}` && <Spinner size="sm" aria-label={t("saving")} />}
                    <Switch
                      size="sm"
                      isSelected={data?.[category][channel] ?? false}
                      isDisabled={!data || !!error || busy || !userUuid}
                      aria-label={`${t(`categories.${category}.title`)}: ${t(`channels.${channel}`)}`}
                      onValueChange={(value) => {
                        void toggle(category, channel, value);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-default-500 text-sm">{t("platformNote")}</p>
        <p className="text-default-500 text-sm">{t("explanation")}</p>
      </CardBody>
    </Card>
  );
}
