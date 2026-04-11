"use client";

import { SectionProps } from "../types";
import { FormInput, FormSelect, FormAutocomplete, SectionHeader } from "../fields";
import useEducationLevels from "@/components/hooks/localization/education";
import useSpokenLanguages from "@/components/hooks/localization/languages";

export default function EducationSection({
  control,
  getValues,
  t,
}: Omit<SectionProps, "setValue">) {
  const educationLevels = useEducationLevels();
  const spokenLanguages = useSpokenLanguages();

  return (
    <>
      <SectionHeader number={4} title={t("sections.education.title")} />
      <FormAutocomplete
        name="education_level"
        control={control}
        label={t("fields.education_level.label")}
        options={educationLevels}
        defaultSelectedKey={getValues("education_level")}
      />
      <FormSelect
        name="languages"
        control={control}
        label={t("fields.spoken_languages.label")}
        options={spokenLanguages}
        selectionMode="multiple"
        defaultSelectedKeys={
          getValues("languages")
            ? getValues("languages").split(",")
            : undefined
        }
      />
      <FormInput
        name="skills"
        control={control}
        label={t("fields.skills.label")}
      />
    </>
  );
}
