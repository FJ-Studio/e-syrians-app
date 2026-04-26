"use client";
import useCountries from "@/components/hooks/localization/country";
import useEducationLevels from "@/components/hooks/localization/education";
import useHealthStatuses from "@/components/hooks/localization/health";
import useSourceOfIncome from "@/components/hooks/localization/income";
import useSpokenLanguages from "@/components/hooks/localization/languages";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { HealthStatus, ReligiousAffiliation } from "@/lib/types/misc";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, Key, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type CensusProps = {
  user?: ESUser;
};

interface CensusFields {
  middle_name: string;
  religious_affiliation: ReligiousAffiliation;
  other_nationalities: string;
  address: string;
  shelter: boolean | string;
  education_level: string;
  languages: string;
  skills: string;
  source_of_income: string;
  estimated_monthly_income: string;
  number_of_dependents: string;
  health_status: string;
  health_insurance: boolean | string;
  easy_access_to_healthcare_services: boolean | string;
  more_info: string;
}

const isCheckedValue = (value: boolean | string | undefined) => value === true || value === "1";

const AccountCensus: FC<CensusProps> = ({ user }) => {
  const locale = useLocale();
  const t = useTranslations("account.settings.census");
  const tSettings = useTranslations("account.settings");
  const religions = useReligiousAffiliation();
  const educationLevels = useEducationLevels();
  const spokenLanguages = useSpokenLanguages();
  const incomeSources = useSourceOfIncome();
  const HealthStatuses = useHealthStatuses();
  const countries = useCountries();
  const serverError = useServerError();
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<CensusFields>({
    defaultValues: {
      middle_name: user?.middle_name ?? undefined,
      religious_affiliation: user?.religious_affiliation ?? undefined,
      other_nationalities: user?.other_nationalities ?? undefined,
      address: user?.address ?? undefined,
      shelter: user?.shelter ?? undefined,
      education_level: user?.education_level ?? undefined,
      languages: user?.languages ?? undefined,
      skills: user?.skills ?? undefined,
      source_of_income: user?.source_of_income ?? undefined,
      estimated_monthly_income: user?.estimated_monthly_income ?? undefined,
      number_of_dependents: user?.number_of_dependents ?? undefined,
      health_status: user?.health_status ?? undefined,
      health_insurance: user?.health_insurance ?? undefined,
      easy_access_to_healthcare_services: user?.easy_access_to_healthcare_services ?? undefined,
      more_info: user?.more_info ?? undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        address: user.address ?? undefined,
        education_level: user.education_level ?? undefined,
        estimated_monthly_income: user.estimated_monthly_income ?? undefined,
        health_insurance: user.health_insurance ?? undefined,
        health_status: user.health_status ?? undefined,
        languages: user.languages ?? undefined,
        middle_name: user.middle_name ?? undefined,
        more_info: user.more_info ?? undefined,
        number_of_dependents: user.number_of_dependents ?? undefined,
        other_nationalities: user.other_nationalities ?? undefined,
        religious_affiliation: user.religious_affiliation ?? undefined,
        shelter: user.shelter ?? undefined,
        skills: user.skills ?? undefined,
        source_of_income: user.source_of_income ?? undefined,
        easy_access_to_healthcare_services: user.easy_access_to_healthcare_services ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async (data: CensusFields) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      switch (key) {
        case "other_nationalities":
        case "languages":
          const splitted = ((data[key as keyof CensusFields] ?? "") as string)?.split(",").filter((v) => v);
          if (splitted.length > 0) {
            splitted.forEach((value: string) => {
              formData.append(`${key}[]`, value);
            });
          }
          break;
        case "health_insurance":
        case "easy_access_to_healthcare_services":
        case "shelter":
          formData.append(
            key,
            isCheckedValue(data[key as keyof CensusFields] as boolean | string | undefined) ? "1" : "0",
          );
          break;
        default:
          formData.append(key, (data[key as keyof CensusFields] as string) ?? "");
          break;
      }
    });
    try {
      const token = await generateToken("update_census");
      formData.append("recaptcha_token", token);
      const response = await fetch("/api/account/profile/update/census", {
        method: "POST",
        headers: {
          "Accept-Language": locale,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.status === 200) {
        toast.success(t("update.success"));
      } else {
        toast.error(result.messages?.[0] ? serverError(result.messages[0]) : extractErrors(result.messages)[0]);
      }
    } catch {
      // Network error — handled by UI state
    }
  };

  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("title")}</h3>
        <p className="text-default-500 text-sm">{t("description")}</p>
      </CardHeader>
      <CardBody>
        <form noValidate className="flex flex-col items-start space-y-4" onSubmit={handleSubmit(save)}>
          <Controller
            name="middle_name"
            control={control}
            render={({ field }) => <Input {...field} label={t("fields.middlename.label")} />}
          />

          <Controller
            name="religious_affiliation"
            control={control}
            rules={{ required: tSettings("validation.required") }}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                label={t("fields.religious_affiliation.label")}
                isRequired
                isInvalid={invalid}
                errorMessage={error?.message}
                value={field.value ?? null}
                onBlur={field.onBlur}
                onChange={(selected: Key | null) => {
                  setValue("religious_affiliation", (selected?.toString() ?? "") as ReligiousAffiliation, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(religions).map((key) => (
                  <AutocompleteItem key={key}>{religions[key as keyof typeof religions]}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />

          <Controller
            name="other_nationalities"
            control={control}
            render={({ field }) => (
              <Select
                scrollShadowProps={{
                  isEnabled: false,
                }}
                {...field}
                label={t("fields.other_nationalities.label")}
                selectedKeys={
                  getValues("other_nationalities") ? getValues("other_nationalities").split(",") : undefined
                }
                onSelectionChange={(selected) => {
                  setValue("other_nationalities", Array.from(selected).join(","));
                }}
                selectionMode="multiple"
              >
                {Object.keys(countries)
                  .filter((c) => c !== "SY")
                  .map((key) => (
                    <SelectItem
                      key={key}
                      startContent={<Avatar src={`/flags/${key.toLowerCase()}.svg`} className="h-6 w-6" size="sm" />}
                    >
                      {countries[key as keyof typeof countries]}
                    </SelectItem>
                  ))}
              </Select>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => <Input {...field} label={t("fields.address.label")} />}
          />
          <div className="flex justify-start">
            <Controller
              name="shelter"
              control={control}
              render={({ field }) => (
                <Checkbox
                  name={field.name}
                  onBlur={field.onBlur}
                  isSelected={isCheckedValue(field.value)}
                  onValueChange={(selected) =>
                    setValue("shelter", selected, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                >
                  {t("fields.shelter.label")}
                </Checkbox>
              )}
            />
          </div>
          <Controller
            name="education_level"
            control={control}
            render={({ field }) => (
              <Autocomplete
                label={t("fields.education_level.label")}
                isInvalid={!!errors.education_level}
                errorMessage={errors.education_level?.message}
                value={field.value ?? null}
                onBlur={field.onBlur}
                onChange={(selected: Key | null) => {
                  setValue("education_level", selected?.toString() ?? "");
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(educationLevels).map((key) => (
                  <AutocompleteItem key={key}>{educationLevels[key as keyof typeof educationLevels]}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          <Controller
            name="languages"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label={t("fields.spoken_languages.label")}
                isInvalid={!!errors.languages}
                errorMessage={errors.languages?.message}
                selectionMode="multiple"
                selectedKeys={getValues("languages") ? getValues("languages").split(",") : undefined}
                onSelectionChange={(selected) => {
                  setValue("languages", Array.from(selected).join(","));
                }}
              >
                {Object.keys(spokenLanguages).map((key) => (
                  <SelectItem key={key}>{spokenLanguages[key as keyof typeof spokenLanguages]}</SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="skills"
            control={control}
            render={({ field }) => <Input {...field} label={t("fields.skills.label")} />}
          />
          <Controller
            name="source_of_income"
            control={control}
            render={({ field }) => (
              <Autocomplete
                label={t("fields.source_of_income.label")}
                value={field.value ?? null}
                onBlur={field.onBlur}
                onChange={(selected: Key | null) => {
                  setValue("source_of_income", selected?.toString() ?? "");
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(incomeSources).map((key) => (
                  <AutocompleteItem key={key}>{incomeSources[key as keyof typeof incomeSources]}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          <Controller
            name="estimated_monthly_income"
            control={control}
            render={({ field }) => (
              <Input {...field} label={t("fields.estimated_monthly_income.label")} startContent="$" />
            )}
          />
          <Controller
            name="number_of_dependents"
            control={control}
            render={({ field }) => <Input {...field} label={t("fields.number_of_dependents.label")} />}
          />
          <Controller
            name="health_status"
            control={control}
            render={({ field }) => (
              <Autocomplete
                label={t("fields.health_status.label")}
                value={field.value ?? null}
                onBlur={field.onBlur}
                onChange={(selected: Key | null) => {
                  setValue("health_status", selected?.toString() as HealthStatus);
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(HealthStatuses).map((key) => (
                  <AutocompleteItem key={key}>{HealthStatuses[key as keyof typeof HealthStatuses]}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          <div className="flex w-full flex-col gap-2">
            <Controller
              name="health_insurance"
              control={control}
              render={({ field }) => (
                <Checkbox
                  name={field.name}
                  onBlur={field.onBlur}
                  isSelected={isCheckedValue(field.value)}
                  onValueChange={(selected) =>
                    setValue("health_insurance", selected, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                >
                  {t("fields.health_insurance.label")}
                </Checkbox>
              )}
            />

            <Controller
              name="easy_access_to_healthcare_services"
              control={control}
              render={({ field }) => (
                <Checkbox
                  name={field.name}
                  onBlur={field.onBlur}
                  isSelected={isCheckedValue(field.value)}
                  onValueChange={(selected) =>
                    setValue("easy_access_to_healthcare_services", selected, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                >
                  {t("fields.easy_access_to_healthcare_services.label")}
                </Checkbox>
              )}
            />
            <Controller
              name="more_info"
              control={control}
              render={({ field }) => <Textarea {...field} label={t("fields.more_info.label")} />}
            />
          </div>
          <Button type="submit" color="primary" isLoading={isSubmitting} isDisabled={!isDirty || isSubmitting}>
            {t("save")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountCensus;
