"use client";

import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import envelopeIcon from "@iconify-icons/heroicons/envelope";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
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
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<NotificationSettings>({
    defaultValues: {
      received_verification_email: false,
      account_verified_email: false,
    },
  });

  useEffect(() => {
    if (data?.user) {
      reset({
        received_verification_email: Boolean(data.user.received_verification_email),
        account_verified_email: Boolean(data.user.account_verified_email),
      });
    }
  }, [data?.user, reset]);

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

  const rows = [
    {
      key: "received_verification_email",
      label: t("received_verification_email"),
      description: t("received_verification_email_description"),
    },
    {
      key: "account_verified_email",
      label: t("account_verified_email"),
      description: t("account_verified_email_description"),
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
        <p className="text-default-500 text-sm">{t("description")}</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(updateNotificationsSettings)}>
          <Table removeWrapper aria-label={t("title")}>
            <TableHeader>
              <TableColumn>{t("columns.notification")}</TableColumn>
              <TableColumn align="center" width={60}>
                <Tooltip content={t("channels.email")}>
                  <div className="flex justify-center">
                    <Icon icon={envelopeIcon} className="text-default-500 size-5" />
                  </div>
                </Tooltip>
              </TableColumn>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-default-700">{row.label}</span>
                      <span className="text-default-400 text-xs">{row.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Controller
                        name={row.key as keyof NotificationSettings}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            isSelected={field.value}
                            onValueChange={field.onChange}
                            aria-label={row.label}
                            size="sm"
                          />
                        )}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="pt-4">
            <Button color="primary" type="submit" isDisabled={!isDirty || isSubmitting} isLoading={isSubmitting}>
              {t("update")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default NotificationsSettings;
