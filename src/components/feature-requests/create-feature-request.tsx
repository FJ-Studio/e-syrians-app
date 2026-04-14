"use client";

import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { Alert, Button, Input, Textarea } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type CreateFeatureRequestFields = {
  title: string;
  description: string;
};

/**
 * Compact two-field form (title + description). Server-side limits are 5-160
 * chars on title and 20-4000 on description — the hook-form rules mirror
 * those so we can show inline errors before the network round-trip. Any
 * validation miss on the server still surfaces via `serverErrors`.
 */
const CreateFeatureRequest: FC = () => {
  const t = useTranslations("feature_requests.create");
  const serverErrors = useServerError();
  const session = useSession();
  const router = useRouter();
  const userIsNotVerified = !session.data?.user?.verified_at;

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CreateFeatureRequestFields>({
    defaultValues: { title: "", description: "" },
  });

  const submit = async (data: CreateFeatureRequestFields) => {
    try {
      const token = await generateToken("feature_request_store");
      const response = await fetch("/api/feature-requests/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description.trim(),
          recaptcha_token: token,
        }),
      });
      if (response.ok) {
        toast.success(t("success"));
        router.push("/feature-requests");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.messages?.[0];
        toast.error(msg ? serverErrors(msg) : t("error"));
      }
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <section className="border-default-200 bg-content1 rounded-large border p-6 sm:p-8">
      <header className="mb-6">
        <h2 className="text-default-900 text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-default-500 mt-1">{t("description")}</p>
      </header>
      {userIsNotVerified && (
        <Alert color="warning" className="mb-6">
          {t("account_unverified_alert")}
        </Alert>
      )}
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <Controller
          name="title"
          control={control}
          rules={{
            required: t("fields.title.required"),
            minLength: { value: 5, message: t("fields.title.min") },
            maxLength: { value: 160, message: t("fields.title.max") },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <Input
              {...field}
              isRequired
              label={t("fields.title.label")}
              placeholder={t("fields.title.placeholder")}
              errorMessage={error?.message}
              isInvalid={invalid}
              isDisabled={userIsNotVerified}
              maxLength={160}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          rules={{
            required: t("fields.description.required"),
            minLength: { value: 20, message: t("fields.description.min") },
            maxLength: { value: 4000, message: t("fields.description.max") },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <Textarea
              {...field}
              isRequired
              minRows={8}
              label={t("fields.description.label")}
              placeholder={t("fields.description.placeholder")}
              description={t("fields.description.help")}
              errorMessage={error?.message}
              isInvalid={invalid}
              isDisabled={userIsNotVerified}
              maxLength={4000}
            />
          )}
        />
        <div className="border-default-200 flex justify-end border-t pt-5">
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isSubmitting}
            isDisabled={userIsNotVerified || isSubmitting}
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default CreateFeatureRequest;
