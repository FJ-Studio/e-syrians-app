"use client";

import { SectionProps } from "../types";
import { FormSelect, FormCheckbox, SectionHeader } from "../fields";
import useHealthStatuses from "@/components/hooks/localization/health";

export default function HealthSection({
  control,
  getValues,
  setValue,
  t,
}: SectionProps) {
  const healthStatuses = useHealthStatuses();

  return (
    <>
      <SectionHeader number={6} title={t("sections.health.title")} />
      <FormSelect
        name="health_status"
        control={control}
        label={t("fields.health_status.label")}
        options={healthStatuses}
        defaultSelectedKeys={[getValues("health_status")]}
      />
      <div className="flex flex-col gap-2">
        <FormCheckbox
          name="health_insurance"
          control={control}
          label={t("fields.health_insurance.label")}
          getValues={getValues}
          setValue={setValue}
        />
        <FormCheckbox
          name="easy_access_to_healthcare_services"
          control={control}
          label={t("fields.easy_access_to_healthcare_services.label")}
          getValues={getValues}
          setValue={setValue}
        />
      </div>
    </>
  );
}
