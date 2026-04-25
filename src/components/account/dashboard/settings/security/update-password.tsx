"use client";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SetPasswordForm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePassword: FC = () => {
  const { data: session } = useSession();
  const [failedTries, setFailedTries] = useState<number>(0);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const serverErrors = useServerError();
  const t = useTranslations("account.dashboard.security");

  const hasPassword = session?.user?.has_password !== false;

  // Change password form (user has password)
  const {
    handleSubmit: handleChangeSubmit,
    control: changeControl,
    setError: setChangeError,
    formState: { isSubmitting: isChangeSubmitting, errors: changeErrors },
  } = useForm<ChangePasswordForm>();

  // Set password form (user has no password)
  const {
    handleSubmit: handleSetSubmit,
    control: setControl,
    setError: setSetError,
    formState: { isSubmitting: isSetSubmitting, errors: setErrors },
  } = useForm<SetPasswordForm>();

  const changePassword = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setChangeError("confirmPassword", { message: t("errors.passwordsDoNotMatch") }, { shouldFocus: true });
      return;
    }
    const token = await generateToken("reset_password");
    const request = await fetch("/api/account/security/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const request = await fetch("/api/account/security/password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const response = await request.json();
      if (response?.success) {
        setOtpSent(true);
        toast.success(t("setPassword.otpSent"));
      } else {
        toast.error(serverErrors(extractErrors(response.messages)[0]));
      }
    } catch {
      // Network error
    } finally {
      setSendingOtp(false);
    }
  };

  const setPassword = async (data: SetPasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setSetError("confirmPassword", { message: t("errors.passwordsDoNotMatch") }, { shouldFocus: true });
      return;
    }
    const token = await generateToken("set_password");
    const request = await fetch("/api/account/security/password/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
    });
    const response = await request.json();
    if (response?.success) {
      toast.success(t("setPassword.success"));
      signOut();
    } else {
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

  // SET PASSWORD flow (no password yet)
  if (!hasPassword) {
    return (
      <Card>
        <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
          <h3 className="text-default-700 text-lg font-medium">{t("setPassword.title")}</h3>
          <p className="text-default-500 text-sm">{t("setPassword.description")}</p>
        </CardHeader>
        <CardBody>
          {!otpSent ? (
            <div className="space-y-4">
              <p className="text-default-600 text-sm">{t("setPassword.sendOtpInfo")}</p>
              <Button color="primary" isLoading={sendingOtp} onPress={sendOtp}>
                {t("setPassword.sendOtp")}
              </Button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSetSubmit(setPassword)} className="space-y-4">
              <Controller
                name="otp"
                control={setControl}
                rules={{
                  required: t("validation.required"),
                  minLength: { value: 6, message: t("validation.otpLength") },
                  maxLength: { value: 6, message: t("validation.otpLength") },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    label={t("setPassword.otpLabel")}
                    isRequired
                    isInvalid={!!setErrors.otp}
                    errorMessage={setErrors.otp?.message}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={setControl}
                rules={{
                  required: t("validation.required"),
                  minLength: { value: 8, message: t("validation.passwordMinLength") },
                  pattern: { value: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, message: t("validation.passwordPattern") },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    label={t("newPassword")}
                    isRequired
                    isInvalid={!!setErrors.newPassword}
                    errorMessage={setErrors.newPassword?.message}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={setControl}
                rules={{ required: t("validation.required") }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    label={t("confirmPassword")}
                    isRequired
                    isInvalid={!!setErrors.confirmPassword}
                    errorMessage={setErrors.confirmPassword?.message}
                  />
                )}
              />
              <div className="flex gap-2">
                <Button color="primary" type="submit" isLoading={isSetSubmitting}>
                  {t("setPassword.submit")}
                </Button>
                <Button variant="flat" onPress={sendOtp} isLoading={sendingOtp}>
                  {t("setPassword.resendOtp")}
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    );
  }

  // CHANGE PASSWORD flow (has password)
  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("password.title")}</h3>
        <p className="text-default-500 text-sm">{t("password.description")}</p>
      </CardHeader>
      <CardBody>
        <form noValidate onSubmit={handleChangeSubmit(changePassword)} className="space-y-4">
          <Controller
            name="currentPassword"
            control={changeControl}
            rules={{ required: t("validation.required") }}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                label={t("currentPassword")}
                isRequired
                isInvalid={!!changeErrors.currentPassword}
                errorMessage={changeErrors.currentPassword?.message}
              />
            )}
          />
          <Controller
            name="newPassword"
            control={changeControl}
            rules={{
              required: t("validation.required"),
              minLength: { value: 8, message: t("validation.passwordMinLength") },
              pattern: { value: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, message: t("validation.passwordPattern") },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                label={t("newPassword")}
                isRequired
                isInvalid={!!changeErrors.newPassword}
                errorMessage={changeErrors.newPassword?.message}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={changeControl}
            rules={{ required: t("validation.required") }}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                label={t("confirmPassword")}
                isRequired
                isInvalid={!!changeErrors.confirmPassword}
                errorMessage={changeErrors.confirmPassword?.message}
              />
            )}
          />
          <Button color="primary" type="submit" isLoading={isChangeSubmitting}>
            {t("actions.changePassword")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdatePassword;
