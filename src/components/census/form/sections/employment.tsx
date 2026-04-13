"use client";

import useSourceOfIncome from "@/components/hooks/localization/income";
import { FormAutocomplete, FormInput, SectionHeader } from "../fields";
import { SectionProps } from "../types";

export default function EmploymentSection({ control, getValues, t }: Omit<SectionProps, "setValue">) {
  const incomeSources = useSourceOfIncome();

  return (
    <>
      <SectionHeader number={5} title={t("sections.employment.title")} />
      <FormAutocomplete
        name="source_of_income"
        control={control}
        label={t("fields.source_of_income.label")}
        options={incomeSources}
        defaultSelectedKey={getValues("source_of_income")}
      />
      <FormInput
        name="estimated_monthly_income"
        control={control}
        label={t("fields.estimated_monthly_income.label")}
        startContent="$"
      />
      <FormInput name="number_of_dependents" control={control} label={t("fields.number_of_dependents.label")} />
    </>
  );
}
