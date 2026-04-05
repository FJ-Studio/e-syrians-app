"use client";

import { Control } from "react-hook-form";
import { RegistrationForm } from "@/lib/types/census";
import { FormTextarea, SectionHeader } from "../fields";

interface MoreInfoSectionProps {
  control: Control<RegistrationForm>;
  t: (key: string) => string;
}

export default function MoreInfoSection({ control, t }: MoreInfoSectionProps) {
  return (
    <>
      <SectionHeader number={7} title={t("sections.more_info.title")} />
      <FormTextarea
        name="more_info"
        control={control}
        label={t("fields.more_info.label")}
        placeholder={t("fields.more_info.placeholder")}
      />
    </>
  );
}
