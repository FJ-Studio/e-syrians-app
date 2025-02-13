"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import ImagesPicker from "@/components/shared/images-picker";
import { ESUser } from "@/lib/types/account";
import { UserIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, CardHeader, Image } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateAvatarProps = {
  user?: ESUser;
};

interface AvatarFields {
  avatar: File;
}

const AccountAvatar: FC<UpdateAvatarProps> = ({ user }) => {
  const [preview, setPreview] = useState<string | null>(null);
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
    try {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA as string, {
              action: "avatar_update",
            })
            .then(resolve)
            .catch(reject);
        });
      });
      const formData = new FormData();
      formData.append("avatar", data.avatar as File);
      formData.append("recaptcha_token", token);
      const response = await fetch("/api/account/profile/update/avatar", {
        method: "POST",
        body: formData,
      });
      if (response.status === 200) {
        toast.success(t("update.success"));
      } else {
        const result = await response.json();
        toast.error(serverError(result.messages?.[0] ?? ""));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 items-start">
        <h2 className="text-lg text-default-700 font-medium">
          {t("avatar.title")}
        </h2>
        <p>{t("avatar.instructions")}</p>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={handleSubmit(save)}
          className="flex flex-col gap-4 items-center"
        >
          <div className="border-2 border-gray-200 min-w-16 min-h-16 flex items-center justify-center rounded-full overflow-hidden p-0.5">
            {preview ? (
              <Image src={preview} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-700" />
            )}
          </div>

          <div className="flex gap-2">
            <ImagesPicker
              setSelectedImages={(images) => setValue("avatar", images[0])}
              maximumFiles={1}
              buttonText={t("avatar.upload")}
              preview={false}
            />
            <Button
              color="primary"
              type="submit"
              isDisabled={isSubmitting || !changes.avatar}
              isLoading={isSubmitting}
            >
              {t("avatar.save")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountAvatar;
