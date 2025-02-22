"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePassword: FC = () => {
  const [failedTries, setFailedTries] = useState<number>(0);
  const serverErrors = useServerError();
  const t = useTranslations("account.dashboard.security");
  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting },
  } = useForm<ChangePasswordForm>();
  const changePassword = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError(
        "confirmPassword",
        { message: t("errors.passwordsDoNotMatch") },
        { shouldFocus: true }
      );
      return;
    }
    const token = await generateToken("reset_password");
    const request = await fetch("/api/account/security/password", {
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
      setFailedTries((prev) => prev + 1);
      toast.error(serverErrors(extractErrors(response.messages)[0]));
    }
  };

  useEffect(() => {
    if (failedTries >= 3) {
      toast.error(t("errors.tooManyTries"));
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failedTries]);

  return (
    <>
      <Card>
        <CardHeader className="text-default-700 font-medium">
          {t("password.title")}
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(changePassword)} className="space-y-4">
            <Controller
              name="currentPassword"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState: { error, invalid } }) => (
                <Input
                  {...field}
                  type="password"
                  label={t("currentPassword")}
                  isRequired
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: true,
                minLength: 8,
                pattern: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
              }}
              render={({ field, fieldState: { error, invalid } }) => (
                <Input
                  {...field}
                  type="password"
                  label={t("newPassword")}
                  isRequired
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState: { error, invalid } }) => (
                <Input
                  {...field}
                  type="password"
                  label={t("confirmPassword")}
                  isRequired
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              // onPress={() => handleSubmit(changePassword)()}
            >
              {t("actions.changePassword")}
            </Button>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UpdatePassword;
