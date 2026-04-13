"use client";

import { RegistrationForm } from "@/lib/types/census";
import { Control } from "react-hook-form";
import { FormInput, SectionHeader } from "../fields";

interface AccountInfoSectionProps {
  control: Control<RegistrationForm>;
  t: (key: string) => string;
}

export default function AccountInfoSection({ control, t }: AccountInfoSectionProps) {
  return (
    <>
      <SectionHeader
        number={1}
        title={t("sections.accountInfo.title")}
        description={t("sections.accountInfo.description")}
      />
      <FormInput
        name="email"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.email.label")}
        placeholder={t("fields.email.placeholder")}
      />
      <FormInput
        name="password"
        control={control}
        rules={{
          required: true,
          pattern: /^(?=.*\d)(?=.*[a-zA-Z]).{6,}$/,
        }}
        isRequired
        type="password"
        label={t("fields.password.label")}
        placeholder={t("fields.password.placeholder")}
        description={t("fields.password.description")}
      />
      <FormInput
        name="password_confirmation"
        control={control}
        rules={{ required: true }}
        isRequired
        type="password"
        label={t("fields.passwordConfirmation.label")}
        placeholder={t("fields.passwordConfirmation.placeholder")}
      />
    </>
  );
}
