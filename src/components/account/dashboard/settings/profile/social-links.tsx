"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import { ESUser } from "@/lib/types/account";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Skeleton,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateSocialLinksProps = {
  user?: ESUser;
};

interface SocialFields {
  facebook_link: string;
  twitter_link: string;
  instagram_link: string;
  linkedin_link: string;
  youtube_link: string;
  twitch_link: string;
  tiktok_link: string;
  website: string;
  github_link: string;
  snapchat_link: string;
  pinterest_link: string;
}

const AccountSocialLinks: FC<UpdateSocialLinksProps> = ({ user }) => {
  const t = useTranslations("account.socialLinks");
  const serverError = useServerError();
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<SocialFields>({
    defaultValues: {
      facebook_link: user?.facebook_link ?? "",
      twitter_link: user?.twitter_link ?? "",
      instagram_link: user?.instagram_link ?? "",
      linkedin_link: user?.linkedin_link ?? "",
      youtube_link: user?.youtube_link ?? "",
      twitch_link: user?.twitch_link ?? "",
      tiktok_link: user?.tiktok_link ?? "",
      website: user?.website ?? "",
      github_link: user?.github_link ?? "",
      snapchat_link: user?.snapchat_link ?? "",
      pinterest_link: user?.pinterest_link ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        facebook_link: user.facebook_link ?? "",
        twitter_link: user.twitter_link ?? "",
        instagram_link: user.instagram_link ?? "",
        linkedin_link: user.linkedin_link ?? "",
        youtube_link: user.youtube_link ?? "",
        twitch_link: user.twitch_link ?? "",
        tiktok_link: user.tiktok_link ?? "",
        website: user.website ?? "",
        github_link: user.github_link ?? "",
        snapchat_link: user.snapchat_link ?? "",
        pinterest_link: user.pinterest_link ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async (data: SocialFields) => {
    try {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA as string, {
              action: "social_links_update",
            })
            .then(resolve)
            .catch(reject);
        });
      });
      const response = await fetch("/api/account/profile/update/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, recaptcha_token: token }),
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
      <CardHeader>
        <h3 className="text-lg text-default-700 font-medium">{t("title")}</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(save)} className="space-y-4">
          {[
            "facebook_link",
            "twitter_link",
            "instagram_link",
            "linkedin_link",
            "youtube_link",
            "twitch_link",
            "tiktok_link",
            "website",
            "github_link",
            "snapchat_link",
            "pinterest_link",
          ].map((social) => (
            <Controller
              key={social}
              name={social as keyof SocialFields}
              control={control}
              render={({ field }) => (
                <Skeleton isLoaded={!!user} className="rounded-lg">
                  <Input {...field} label={t(`${social}.label`)} />
                </Skeleton>
              )}
            />
          ))}
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
          >
            {t("save")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountSocialLinks;
