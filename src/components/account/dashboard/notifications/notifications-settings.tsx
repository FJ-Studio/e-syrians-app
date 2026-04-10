"use client";

import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Card, CardBody, CardHeader, Switch } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface NotificationSettings {
  received_verification_email: boolean;
  account_verified_email: boolean;
}

const NotificationsSettings: FC = () => {
  const { data } = useSession();
  const serverErrors = useServerError();
  const t = useTranslations("account.dashboard.notifications.preferences");
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<NotificationSettings>({
    defaultValues: {
      received_verification_email: Boolean(
        data?.user?.received_verification_email,
      ),
      account_verified_email: Boolean(data?.user?.account_verified_email),
    },
  });

  const updateNotificationsSettings = async (data: NotificationSettings) => {
    const token = await generateToken("update_notifications_settings");
    const req = await fetch("/api/account/settings/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
    });
    const response = await req.json();
    if (response.success) {
      toast.success(t("success"));
    } else {
      toast.error(serverErrors(extractErrors(response.messages)[0]));
    }
  };

  return (
    <Card>
      <CardHeader className="text-default-700 font-medium">
        {t("title")}
      </CardHeader>
      <CardBody>
        <form
          className="space-y-3"
          onSubmit={handleSubmit(updateNotificationsSettings)}
        >
          <div className="flex justify-between gap-3">
            <p>{t("received_verification_email")}</p>
            <Controller
              name="received_verification_email"
              control={control}
              render={({ field }) => (
                <Switch
                  {...field}
                  value={String(field.value)}
                  defaultSelected={data?.user.received_verification_email}
                  aria-label={t("received_verification_email")}
                />
              )}
            />
          </div>
          <div className="flex justify-between gap-3">
            <p>{t("account_verified_email")}</p>
            <Controller
              name="account_verified_email"
              control={control}
              render={({ field }) => (
                <Switch
                  {...field}
                  value={String(field.value)}
                  defaultSelected={data?.user.account_verified_email}
                  aria-label={t("account_verified_email")}
                />
              )}
            />
          </div>
          <Button
            color="primary"
            type="submit"
            isDisabled={!isDirty || isSubmitting}
            isLoading={isSubmitting}
          >
            {t("update")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default NotificationsSettings;
