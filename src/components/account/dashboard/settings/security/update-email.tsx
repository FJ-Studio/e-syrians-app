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
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
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
      <CardHeader className="text-default-700 font-medium">{t("title")}</CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit(updateEmailAddress)}>
          <p className="text-start text-sm">{t("description")}</p>
          <Controller
            name="email"
            control={control}
            rules={{ required: true, pattern: /^\S+@\S+$/i }}
            render={({ field }) => (
              <Input
                label={t("email")}
                {...field}
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
