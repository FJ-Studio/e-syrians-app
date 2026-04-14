"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import ImagesPicker from "@/components/shared/images-picker";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { Button, Card, CardBody, CardHeader, Image, Skeleton } from "@heroui/react";
import userIcon from "@iconify-icons/heroicons/user";
import { Icon } from "@iconify/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type UpdateAvatarProps = {
  user?: ESUser;
  onUpdated?: () => void;
};

interface AvatarFields {
  avatar: File;
}

const AccountAvatar: FC<UpdateAvatarProps> = ({ user, onUpdated }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("account.settings.avatar");
  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<AvatarFields>({
    defaultValues: {
      avatar: undefined,
    },
  });

  // Use `useWatch` instead of the form's `watch()` so the subscription plays
  // nicely with React Compiler memoization.
  const avatar = useWatch({ control, name: "avatar" });
  const serverError = useServerError();

  /* eslint-disable react-hooks/set-state-in-effect --
   * Manage the lifetime of the object URL for the picked File. This is the
   * canonical `URL.createObjectURL` + cleanup pattern — it genuinely needs
   * state tied to an effect because the URL is an imperative resource that
   * must be revoked. React Compiler's rule doesn't cover this case cleanly.
   */
  useEffect(() => {
    if (!(avatar instanceof File)) return;
    const objectUrl = URL.createObjectURL(avatar);
    setBlobUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setBlobUrl(null);
    };
  }, [avatar]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Preview is derived during render: the blob URL takes precedence when a
  // new file is picked, otherwise fall back to the user's saved avatar.
  const preview = blobUrl ?? user?.avatar ?? null;

  const save = async (data: AvatarFields) => {
    const token = await generateToken("update_avatar");
    const formData = new FormData();
    formData.append("avatar", data.avatar as File);
    formData.append("recaptcha_token", token);
    const response = await fetch("/api/account/profile/update/avatar", {
      method: "POST",
      headers: {
        "Accept-Language": locale,
      },
      body: formData,
    });

    if (response.ok) {
      toast.success(t("update.success"));
      // Refetch profile so the new server-side avatar URL propagates everywhere
      onUpdated?.();
    } else {
      try {
        const result = await response.json();
        const messages = result.messages;
        if (messages) {
          // messages can be string[] or Record<string, string[]>
          const errors = Array.isArray(messages) ? messages : extractErrors(messages);
          const translated = errors.map((msg: string) => serverError(msg));
          toast.error(translated.join(". "));
        } else {
          toast.error(t("update.error"));
        }
      } catch {
        toast.error(t("update.error"));
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2">
        <h2 className="text-default-700 text-lg font-medium">{t("avatar.title")}</h2>
        <p>{t("avatar.instructions")}</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(save)} className="flex flex-col items-center gap-4">
          <Skeleton isLoaded={!!user} className="rounded-full">
            <div className="flex min-h-16 min-w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 p-0.5">
              {preview ? (
                <Image src={preview} alt={user?.name} className="h-16 w-16 overflow-hidden rounded-full" />
              ) : (
                <Icon icon={userIcon} className="h-8 w-8 text-gray-700" />
              )}
            </div>
          </Skeleton>

          <div className="flex gap-2">
            <ImagesPicker
              setSelectedImages={(images) => setValue("avatar", images[0])}
              maximumFiles={1}
              buttonText={t("avatar.upload")}
              preview={false}
            />
            <Button color="primary" type="submit" isDisabled={isSubmitting || !avatar} isLoading={isSubmitting}>
              {t("avatar.save")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountAvatar;
