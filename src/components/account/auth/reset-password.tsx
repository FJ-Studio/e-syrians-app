"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Input } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface SendLinkForm {
  email: string;
  password: string;
  password_confirmation: string;
}

const ResetPassword: FC = () => {
  const sp = useSearchParams();
  const { push } = useRouter();

  const serverErrors = useServerError();
  const t = useTranslations("auth.resetPassword");
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<SendLinkForm>();

  const sendLink = async (data: SendLinkForm) => {
    const token = await generateToken("reset_password");
    const request = await fetch("/api/account/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        recaptcha_token: token,
        token: sp.get("token"),
      }),
    });
    const response = await request.json();
    if (response?.success) {
      reset();
      toast.success(t("success"));
      window.setTimeout(() => push("/auth/sign-in"), 2000);
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
        render={({ field }) => <Input {...field} type="email" isRequired label={t("email")} />}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => <Input {...field} type="password" isRequired label={t("newPassword")} />}
      />
      <Controller
        name="password_confirmation"
        control={control}
        render={({ field }) => <Input {...field} type="password" isRequired label={t("newPasswordConfirmation")} />}
      />
      <Button fullWidth color="primary" isLoading={isSubmitting} type="submit">
        {t("resetPassword")}
      </Button>
    </form>
  );
};

export default ResetPassword;
