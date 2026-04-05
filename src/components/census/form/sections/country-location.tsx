"use client";

import { SectionProps } from "../types";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  SectionHeader,
} from "../fields";
import useCountries from "@/components/hooks/localization/country";
import useProvinces from "@/components/hooks/localization/provinces";
import { Avatar, SelectItem } from "@heroui/react";

export default function CountryLocationSection({
  control,
  getValues,
  setValue,
  t,
}: SectionProps) {
  const countries = useCountries();
  const provinces = useProvinces();

  const countryRenderItem = (key: string, label: string) => (
    <SelectItem
      key={key}
      startContent={
        <Avatar
          src={`/flags/${key.toLowerCase()}.svg`}
          className="w-6 h-6"
          size="sm"
        />
      }
    >
      {label}
    </SelectItem>
  );

  return (
    <>
      {/* Country of residence (part of personal data flow) */}
      <FormSelect
        name="country"
        control={control}
        rules={{ required: true }}
        isRequired
        label={t("fields.country.label")}
        description={t("fields.country.description")}
        options={countries}
        defaultSelectedKeys={[getValues("country")]}
        scrollShadowProps={{ isEnabled: false }}
        renderItem={countryRenderItem}
      />

      {getValues("country") === "SY" && (
        <FormSelect
          name="city_inside_syria"
          control={control}
          rules={{ required: true }}
          isRequired
          label={t("fields.city_inside_syria.label")}
          options={provinces}
          defaultSelectedKeys={[getValues("city_inside_syria")]}
          onSelectionChange={(selected) =>
            setValue(
              "city",
              provinces[selected.anchorKey as keyof typeof provinces]
            )
          }
        />
      )}

      {/* Section 3: Census Data */}
      <SectionHeader
        number={3}
        title={t("sections.censusData.title")}
        description={t("sections.censusData.description")}
      />
      <FormInput
        name="national_id"
        control={control}
        label={t("fields.national_id.label")}
        placeholder={t("fields.national_id.placeholder")}
        description={t("fields.national_id.description")}
      />
      <FormInput
        name="record_id"
        control={control}
        label={t("fields.record_id.label")}
        description={t("fields.record_id.description")}
      />
      <FormSelect
        name="other_nationalities"
        control={control}
        label={t("fields.other_nationalities.label")}
        description={t("fields.other_nationalities.description")}
        selectionMode="multiple"
        options={Object.fromEntries(
          Object.entries(countries).filter(([c]) => c !== "SY")
        )}
        defaultSelectedKeys={
          getValues("other_nationalities")
            ? getValues("other_nationalities").split(",")
            : undefined
        }
        scrollShadowProps={{ isEnabled: false }}
        renderItem={countryRenderItem}
      />

      {/* Section 4: Location Data */}
      <SectionHeader
        number={4}
        title={t("sections.locationData.title")}
        description={t("sections.locationData.description")}
      />
      <FormInput
        name="city"
        control={control}
        label={t("fields.city.label")}
        description={t("fields.city.description")}
      />
      <FormInput
        name="address"
        control={control}
        label={t("fields.address.label")}
        description={t("fields.address.description")}
      />
      <FormCheckbox
        name="shelter"
        control={control}
        label={t("fields.shelter.label")}
        getValues={getValues}
        setValue={setValue}
      />
    </>
  );
}
