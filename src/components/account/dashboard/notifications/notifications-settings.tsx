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
  const hasEmailPreferences = NOTIFICATION_CATEGORIES.some((category) => typeof data?.[category].email === "boolean");
  const channels = NOTIFICATION_CHANNELS.filter((channel) => channel !== "email" || hasEmailPreferences);
  const rowLayout = hasEmailPreferences ? "md:grid-cols-[minmax(0,1fr)_18rem]" : "md:grid-cols-[minmax(0,1fr)_12rem]";
  const channelLayout = hasEmailPreferences ? "grid-cols-3" : "grid-cols-2";

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
    <Card className="w-full max-w-5xl" shadow="sm">
      <CardHeader className="flex flex-col items-start gap-2 px-5 pt-5 pb-4 text-start sm:px-6 sm:pt-6">
        <h3 className="text-foreground text-lg font-semibold">{t("title")}</h3>
        <p className="text-default-500 max-w-2xl text-sm leading-6">{t("description")}</p>
      </CardHeader>
      <CardBody className="gap-0 px-5 pt-0 pb-5 text-start sm:px-6 sm:pb-6">
        {(!userUuid || isLoading) && (
          <div role="status" className="flex items-center gap-3 py-4">
            <Spinner size="sm" />
            <span>{t("loading")}</span>
          </div>
        )}
        {error && (
          <div role="alert" className="space-y-3 pb-4">
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
        <div
          aria-hidden="true"
          className={`text-default-500 bg-default-50 hidden items-center gap-6 rounded-lg px-3 py-3 text-xs font-medium md:grid ${rowLayout}`}
        >
          <span>{t("categoryColumn")}</span>
          <div className={`grid text-center ${channelLayout}`}>
            {channels.map((channel) => (
              <span key={channel}>{t(`channels.${channel}`)}</span>
            ))}
          </div>
        </div>
        {NOTIFICATION_CATEGORIES.map((category) => (
          <section
            key={category}
            className={`border-default-100 grid items-center gap-3 border-b py-4 md:gap-6 md:px-3 ${rowLayout}`}
            aria-label={t(`categories.${category}.title`)}
          >
            <div className="min-w-0 space-y-1">
              <h4 className="text-foreground text-sm font-medium">{t(`categories.${category}.title`)}</h4>
              <p className="text-default-500 max-w-prose text-sm leading-5">{t(`categories.${category}.body`)}</p>
            </div>
            <div className={`grid ${channelLayout}`}>
              {channels.map((channel) => {
                const available = channel !== "email" || typeof data?.[category].email === "boolean";
                return (
                  <div key={channel} className="flex min-w-0 flex-col items-center gap-1">
                    <span aria-hidden="true" className="text-default-500 text-center text-xs md:hidden">
                      {t(`channels.${channel}`)}
                    </span>
                    <div className="relative flex min-h-11 w-full items-center justify-center">
                      {available ? (
                        <Switch
                          size="sm"
                          classNames={{ base: "m-0 min-h-11 min-w-11 justify-center p-2", wrapper: "me-0" }}
                          isSelected={data?.[category][channel] ?? false}
                          isDisabled={!data || !!error || busy || !userUuid}
                          aria-label={`${t(`categories.${category}.title`)}: ${t(`channels.${channel}`)}`}
                          onValueChange={(value) => {
                            void toggle(category, channel, value);
                          }}
                        />
                      ) : (
                        <span className="text-default-400 text-sm" role="note">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">
                            {t(`categories.${category}.title`)}: {t(`channels.${channel}`)} — {t("notAvailable")}
                          </span>
                        </span>
                      )}
                      {saving === `${category}.${channel}` && (
                        <Spinner className="pointer-events-none absolute end-0" size="sm" aria-label={t("saving")} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <details className="text-default-500 pt-4 text-sm">
          <summary className="text-default-600 focus-visible:outline-primary cursor-pointer rounded-sm leading-6 focus-visible:outline-2 focus-visible:outline-offset-4">
            {t("deliveryDetails")}
          </summary>
          <div className="max-w-prose space-y-2 pt-3 leading-6">
            <p>{t("pushNote")}</p>
            {hasEmailPreferences && <p>{t("emailNote")}</p>}
            <p>{t("platformNote")}</p>
            <p>{t("explanation")}</p>
          </div>
        </details>
      </CardBody>
    </Card>
  );
}
