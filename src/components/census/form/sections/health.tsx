"use client";

import useHealthStatuses from "@/components/hooks/localization/health";
import { FormAutocomplete, FormCheckbox, SectionHeader } from "../fields";
import { SectionProps } from "../types";

export default function HealthSection({ control, getValues, t }: SectionProps) {
  const healthStatuses = useHealthStatuses();

  return (
    <>
      <SectionHeader number={6} title={t("sections.health.title")} />
      <FormAutocomplete
        name="health_status"
        control={control}
        label={t("fields.health_status.label")}
        options={healthStatuses}
        defaultSelectedKey={getValues("health_status")}
      />
      <div className="flex flex-col gap-2">
        <FormCheckbox name="health_insurance" control={control} label={t("fields.health_insurance.label")} />
        <FormCheckbox
          name="easy_access_to_healthcare_services"
          control={control}
          label={t("fields.easy_access_to_healthcare_services.label")}
        />
      </div>
    </>
  );
}
