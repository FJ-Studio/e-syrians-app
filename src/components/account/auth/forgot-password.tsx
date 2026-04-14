"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Input } from "@heroui/react";
import arrowLongLeftSolid from "@iconify-icons/heroicons/arrow-long-left-solid";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface SendLinkForm {
  email: string;
}

const ForgotPassword: FC = () => {
  const { push } = useRouter();

  const serverErrors = useServerError();
  const t = useTranslations("auth.forgotPassword");
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<SendLinkForm>();

  const sendLink = async (data: SendLinkForm) => {
    const token = await generateToken("forgot_password");
    const request = await fetch("/api/account/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
    });
    const response = await request.json();
    if (response?.success) {
      reset();
      toast.success(t("success"));
      window.setTimeout(() => push("/auth/signin"), 2000);
    } else {
      toast.error(serverErrors(extractErrors(response.messages)[0]));
    }
  };

  return (
    <form onSubmit={handleSubmit(sendLink)} className="space-y-4">
      <h1 className="text-lg font-medium">{t("title")}</h1>
      <p>{t("description")}</p>
      <Controller
        name="email"
        control={control}
        render={({ field }) => <Input {...field} isRequired label={t("email")} type="email" />}
      />
      <p className="flex items-center gap-2">
        <Icon icon={arrowLongLeftSolid} width={20} height={20} className="size-5 rtl:rotate-180" />
        <Link href="/auth/signin" title={t("backToLogin")} className="text-sm">
          {t("backToLogin")}
        </Link>
      </p>
      <Button fullWidth color="primary" isLoading={isSubmitting} type="submit">
        {t("sendLink")}
      </Button>
    </form>
  );
};

export default ForgotPassword;
