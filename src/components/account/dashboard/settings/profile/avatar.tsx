"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import ImageCropper from "@/components/shared/image-cropper";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { Button, Card, CardBody, CardHeader, Image } from "@heroui/react";
import photoIcon from "@iconify-icons/heroicons/photo";
import userIcon from "@iconify-icons/heroicons/user";
import { Icon } from "@iconify/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, useCallback, useEffect, useRef, useState } from "react";
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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setIsCropperOpen(true);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }, []);

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      setValue("avatar", croppedFile);
      if (cropSrc) {
        URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
      }
    },
    [setValue, cropSrc],
  );

  const handleCropperClose = useCallback(() => {
    setIsCropperOpen(false);
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  }, [cropSrc]);

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
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h2 className="text-default-700 text-lg font-medium">{t("avatar.title")}</h2>
        <p className="text-default-500 text-sm">{t("avatar.instructions")}</p>
      </CardHeader>
      <CardBody>
        <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col items-center gap-4">
          <div className="border-default-200 flex min-h-16 min-w-16 items-center justify-center overflow-hidden rounded-full border-2 p-0.5">
            {preview ? (
              <Image src={preview} alt={user?.name} className="h-16 w-16 overflow-hidden rounded-full" />
            ) : (
              <Icon icon={userIcon} className="text-default-700 h-8 w-8" />
            )}
          </div>

          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            <Button
              color="default"
              variant="flat"
              startContent={<Icon icon={photoIcon} className="size-5" />}
              onPress={() => fileInputRef.current?.click()}
              type="button"
            >
              {t("avatar.upload")}
            </Button>
            <Button color="primary" type="submit" isDisabled={isSubmitting || !avatar} isLoading={isSubmitting}>
              {t("avatar.save")}
            </Button>
          </div>
        </form>

        {cropSrc && (
          <ImageCropper
            imageSrc={cropSrc}
            isOpen={isCropperOpen}
            onClose={handleCropperClose}
            onCropComplete={handleCropComplete}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default AccountAvatar;
