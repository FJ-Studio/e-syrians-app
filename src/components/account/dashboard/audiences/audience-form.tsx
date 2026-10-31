"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { Audience } from "@/lib/types/audience";
import { Button, Input, Textarea } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export interface AudienceFormProps {
  mode: "create" | "edit";
  audience?: Audience;
  /**
   * When set, the form skips its default navigation on successful
   * create and invokes this callback instead. Used by the create-poll
   * modal so the poll form can stay mounted and auto-select the new
   * audience. Only meaningful for `mode="create"`.
   */
  onCreated?: (audience: Audience) => void;
  /**
   * Overrides the default "Cancel" behaviour (which is
   * `router.back()`). Passed in by callers that render the form
   * inside a modal so Cancel can just close the modal.
   */
  onCancel?: () => void;
}

interface AudienceFormFields {
  name: string;
  description: string;
  entries: string;
}

const NAME_MAX = 255;
const DESCRIPTION_MAX = 1000;

/**
 * Shared audience form. `mode="create"` posts the initial entries too;
 * `mode="edit"` only PATCHes name / description — entries are managed
 * from the detail page.
 */
const AudienceForm: FC<AudienceFormProps> = ({ mode, audience, onCreated, onCancel }) => {
  const t = useTranslations("account.dashboard.audiences.form");
  const serverError = useServerError();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AudienceFormFields>({
    defaultValues: {
      name: audience?.name ?? "",
      description: audience?.description ?? "",
      entries: "",
    },
  });

  const submit = async (data: AudienceFormFields) => {
    try {
      if (mode === "create") {
        // Split the pasted textarea into trimmed non-empty lines
        // and hand them to the backend as-is. The API's per-entry
        // validator will surface any malformed rows in the toast;
        // we deliberately do NOT filter client-side so an invalid
        // paste can't be silently dropped.
        const entries = (data.entries ?? "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        const recaptcha_token = await generateToken("audience_create");
        const req = await fetch("/api/account/audiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            description: data.description.trim().length > 0 ? data.description : null,
            entries,
            recaptcha_token,
          }),
        });
        const body = await req.json();
        if (req.ok && body.success) {
          toast.success(t("createSuccess"));
          const created = body.data as Audience | undefined;
          // Embedded (modal) usage: hand the created audience back
          // to the caller and let them decide what to do next
          // (usually: close the modal + auto-select). Standalone
          // page usage falls back to the historical navigation.
          if (onCreated && created) {
            onCreated(created);
          } else {
            router.push(created?.uuid ? `/account/audiences/${created.uuid}` : "/account/audiences");
          }
        } else {
          toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
        }
        return;
      }

      // Edit mode.
      if (!audience) return;
      const recaptcha_token = await generateToken("audience_update");
      const req = await fetch(`/api/account/audiences/${audience.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description.trim().length > 0 ? data.description : null,
          recaptcha_token,
        }),
      });
      const body = await req.json();
      if (req.ok && body.success) {
        toast.success(t("editSuccess"));
        router.push(`/account/audiences/${audience.uuid}`);
      } else {
        toast.error(serverError((body?.messages?.[0] as string) ?? "unknown_error"));
      }
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-default-700 text-xl font-medium">{mode === "create" ? t("createTitle") : t("editTitle")}</h2>
      <p className="text-default-500 mb-6">{mode === "create" ? t("createDescription") : t("editDescription")}</p>

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{
            required: t("name.error"),
            minLength: { value: 2, message: t("name.error") },
            maxLength: { value: NAME_MAX, message: t("name.errorMax") },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <Input
              {...field}
              isRequired
              label={t("name.label")}
              placeholder={t("name.placeholder")}
              maxLength={NAME_MAX}
              errorMessage={error?.message}
              isInvalid={invalid}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{
            maxLength: { value: DESCRIPTION_MAX, message: t("description.errorMax") },
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <Textarea
              {...field}
              label={t("description.label")}
              placeholder={t("description.placeholder")}
              maxLength={DESCRIPTION_MAX}
              description={t("description.help")}
              errorMessage={error?.message}
              isInvalid={invalid}
            />
          )}
        />

        {mode === "create" ? (
          <Controller
            name="entries"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label={t("entries.label")}
                placeholder={t("entries.placeholder")}
                description={t("entries.help")}
                minRows={8}
              />
            )}
          />
        ) : null}

        <div className="flex gap-2">
          <Button color="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
            {mode === "create" ? t("createSubmit") : t("editSubmit")}
          </Button>
          <Button variant="light" onPress={() => (onCancel ? onCancel() : router.back())}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AudienceForm;
