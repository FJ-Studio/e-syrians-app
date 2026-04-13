"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import ImagesPicker from "@/components/shared/images-picker";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { UserIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, CardHeader, Image, Skeleton } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateAvatarProps = {
  user?: ESUser;
  onUpdated?: () => void;
};

interface AvatarFields {
  avatar: File;
}

const AccountAvatar: FC<UpdateAvatarProps> = ({ user, onUpdated }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("account.settings.avatar");
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<AvatarFields>({
    defaultValues: {
      avatar: undefined,
    },
  });

  const changes = watch();
  const serverError = useServerError();

  useEffect(() => {
    if (user?.avatar) {
      setPreview(user.avatar);
    }
    if (changes.avatar instanceof File) {
      const objectUrl = URL.createObjectURL(changes.avatar);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [changes.avatar, user]);

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
                <UserIcon className="h-8 w-8 text-gray-700" />
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
            <Button color="primary" type="submit" isDisabled={isSubmitting || !changes.avatar} isLoading={isSubmitting}>
              {t("avatar.save")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountAvatar;
