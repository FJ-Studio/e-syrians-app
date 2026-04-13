"use client";

import useEthnicity from "@/components/hooks/localization/ethnicity";
import useGender from "@/components/hooks/localization/gender";
import useProvinces from "@/components/hooks/localization/provinces";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import { FormAutocomplete, FormDatePicker, FormInput, FormSelect, SectionHeader } from "../fields";
import { SectionProps } from "../types";

export default function PersonalDataSection({ control, getValues, setValue, t }: SectionProps) {
  const genderOptions = useGender();
  const provinces = useProvinces();
  const ethnicities = useEthnicity();
  const religions = useReligiousAffiliation();

  return (
    <>
      <SectionHeader
        number={2}
        title={t("sections.peronalData.title")}
        description={t("sections.peronalData.description")}
      />
      <FormInput
        name="name"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.name.label")}
        placeholder={t("fields.name.placeholder")}
      />
      <FormInput name="middle_name" control={control} label={t("fields.middlename.label")} />
      <FormInput
        name="surname"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.surname.label")}
        placeholder={t("fields.surname.placeholder")}
      />
      <FormSelect
        name="gender"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.gender.label")}
        options={genderOptions}
        defaultSelectedKeys={[getValues("gender")]}
      />
      <FormDatePicker
        name="birth_date"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.birth_date.label")}
        getValues={getValues}
        setValue={setValue}
      />
      <FormAutocomplete
        name="hometown"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.hometown.label")}
        description={t("fields.hometown.description")}
        options={provinces}
        defaultSelectedKey={getValues("hometown")}
      />
      <FormAutocomplete
        name="ethnicity"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.ethnicity.label")}
        options={ethnicities}
        defaultSelectedKey={getValues("ethnicity")}
      />
      <FormAutocomplete
        name="religious_affiliation"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.religious_affiliation.label")}
        description={t("fields.religious_affiliation.description")}
        options={religions}
        defaultSelectedKey={getValues("religious_affiliation")}
      />
    </>
  );
}
