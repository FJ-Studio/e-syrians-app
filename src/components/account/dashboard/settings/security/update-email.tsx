"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface UpdateEmailAddressForm {
  email: string;
}

const UpdateEmailAddress: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const serverErrors = useServerError();
  const { data } = useSession();
  const t = useTranslations("account.dashboard.security.email");
  const tSecurity = useTranslations("account.dashboard.security");
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<UpdateEmailAddressForm>({
    defaultValues: {
      email: data?.user.email,
    },
  });

  const updateEmailAddress = async (data: UpdateEmailAddressForm) => {
    const token = await generateToken("update_email");
    const request = await fetch("/api/account/security/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
    });
    const response = await request.json();
    if (response?.success) {
      toast.success(t("success"));
      signOut();
    } else {
      toast.error(serverErrors(extractErrors(response.messages)[0]));
    }
  };

  const getVerificationLink = async () => {
    setLoading(true);
    try {
      const request = await fetch("/api/account/security/verification-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recaptcha_token: await generateToken("get_verification_link"),
        }),
      });
      const response = await request.json();
      if (response?.success) {
        toast.success(t("verificationLinkSent"));
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0]));
      }
    } catch {
      // Network error — handled by loading state
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
        <p className="text-default-500 text-sm">{t("description")}</p>
      </CardHeader>
      <CardBody>
        <form noValidate className="space-y-4" onSubmit={handleSubmit(updateEmailAddress)}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: tSecurity("validation.required"),
              pattern: { value: /^\S+@\S+$/i, message: tSecurity("validation.emailInvalid") },
            }}
            render={({ field }) => (
              <Input
                label={t("email")}
                {...field}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                description={
                  <div className="flex items-center justify-between">
                    {t("emailVerificationStatus", {
                      status: data?.user.email_verified_at ? t("verified") : t("notVerified"),
                    })}
                    {!data?.user.email_verified_at && (
                      <button
                        type="button"
                        className="text-tiny text-foreground-400 border-0 bg-transparent"
                        disabled={loading}
                        onClick={getVerificationLink}
                      >
                        {loading ? t("sending") : t("resendVerification")}
                      </button>
                    )}
                  </div>
                }
              />
            )}
          />
          <Button isDisabled={!isDirty || isSubmitting} isLoading={isSubmitting} color="primary" type="submit">
            {t("change")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdateEmailAddress;
