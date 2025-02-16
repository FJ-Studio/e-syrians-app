"use client";
import useCountries from "@/components/hooks/localization/country";
import useEducationLevels from "@/components/hooks/localization/education";
import useHealthStatuses from "@/components/hooks/localization/health";
import useSourceOfIncome from "@/components/hooks/localization/income";
import useSpokenLanguages from "@/components/hooks/localization/languages";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { ESUser } from "@/lib/types/account";
import { HealthStatus, ReligiousAffiliation } from "@/lib/types/misc";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Skeleton,
  Textarea,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type CensusProps = {
  user?: ESUser;
};

interface CensusFields {
  middle_name: string;
  religious_affiliation: ReligiousAffiliation;
  other_nationalities: string;
  city: string;
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

const AccountCensus: FC<CensusProps> = ({ user }) => {
  const t = useTranslations("account.settings.census");
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
    formState: { isSubmitting, isDirty },
  } = useForm<CensusFields>({
    defaultValues: {
      middle_name: user?.middle_name ?? undefined,
      religious_affiliation: user?.religious_affiliation ?? undefined,
      other_nationalities: user?.other_nationalities ?? undefined,
      city: user?.city ?? undefined,
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
      easy_access_to_healthcare_services:
        user?.easy_access_to_healthcare_services ?? undefined,
      more_info: user?.more_info ?? undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        address: user.address ?? undefined,
        city: user.city ?? undefined,
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
        easy_access_to_healthcare_services:
          user.easy_access_to_healthcare_services ?? undefined,
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
          const splitted = ((data[key as keyof CensusFields] ?? "") as string)
            ?.split(",")
            .filter((v) => v);
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
            (data[key as keyof CensusFields] as boolean) ? "1" : "0"
          );
          break;
        default:
          formData.append(
            key,
            (data[key as keyof CensusFields] as string) ?? ""
          );
          break;
      }
    });
    try {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA as string, {
              action: "census_update",
            })
            .then(resolve)
            .catch(reject);
        });
      });
      formData.append("recaptcha_token", token);
      const response = await fetch("/api/account/profile/update/census", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.status === 200) {
        toast.success(t("update.success"));
      } else {
        toast.error(
          result.messages?.[0]
            ? serverError(result.messages[0])
            : extractErrors(result.messages)[0]
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{t("title")}</h3>
      </CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit(save)}>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="middle_name"
              control={control}
              render={({ field }) => (
                <Input {...field} label={t("fields.middlename.label")} />
              )}
            />
          </Skeleton>

          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="religious_affiliation"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState: { error, invalid } }) => (
                <Select
                  {...field}
                  label={t("fields.religious_affiliation.label")}
                  isRequired
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  selectedKeys={[getValues("religious_affiliation")]}
                >
                  {Object.keys(religions).map((key) => (
                    <SelectItem key={key} value={key}>
                      {religions[key as keyof typeof religions]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>

          <Skeleton isLoaded={!!user} className="rounded-lg">
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
                    getValues("other_nationalities")
                      ? getValues("other_nationalities").split(",")
                      : undefined
                  }
                  onSelectionChange={(selected) => {
                    setValue(
                      "other_nationalities",
                      Array.from(selected).join(",")
                    );
                  }}
                  selectionMode="multiple"
                >
                  {Object.keys(countries)
                    .filter((c) => c !== "SY")
                    .map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                        startContent={
                          <Avatar
                            src={`/flags/${key.toLowerCase()}.svg`}
                            className="w-6 h-6"
                            size="sm"
                          />
                        }
                      >
                        {countries[key as keyof typeof countries]}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input {...field} label={t("fields.city.label")} />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} label={t("fields.address.label")} />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="shelter"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  value={`${field.value}`}
                  isSelected={!!getValues("shelter")}
                  onValueChange={(selected) =>
                    setValue("shelter", selected ? "1" : "0")
                  }
                >
                  {t("fields.shelter.label")}
                </Checkbox>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="education_level"
              control={control}
              render={({ field, fieldState: { error, invalid } }) => (
                <Select
                  {...field}
                  label={t("fields.education_level.label")}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  selectedKeys={[getValues("education_level")]}
                >
                  {Object.keys(educationLevels).map((key) => (
                    <SelectItem key={key} value={key}>
                      {educationLevels[key as keyof typeof educationLevels]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="languages"
              control={control}
              render={({ field, fieldState: { error, invalid } }) => (
                <Select
                  {...field}
                  label={t("fields.spoken_languages.label")}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  selectionMode="multiple"
                  selectedKeys={
                    getValues("languages")
                      ? getValues("languages").split(",")
                      : undefined
                  }
                  onSelectionChange={(selected) => {
                    setValue("languages", Array.from(selected).join(","));
                  }}
                >
                  {Object.keys(spokenLanguages).map((key) => (
                    <SelectItem key={key} value={key}>
                      {spokenLanguages[key as keyof typeof spokenLanguages]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <Input {...field} label={t("fields.skills.label")} />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="source_of_income"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t("fields.source_of_income.label")}
                  selectedKeys={[getValues("source_of_income")]}
                >
                  {Object.keys(incomeSources).map((key) => (
                    <SelectItem key={key} value={key}>
                      {incomeSources[key as keyof typeof incomeSources]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="estimated_monthly_income"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("fields.estimated_monthly_income.label")}
                  startContent="$"
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="number_of_dependents"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("fields.number_of_dependents.label")}
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="health_status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t("fields.health_status.label")}
                  selectedKeys={[getValues("health_status")]}
                  onSelectionChange={(selected) => {
                    setValue(
                      "health_status",
                      selected.anchorKey as HealthStatus
                    );
                  }}
                >
                  {Object.keys(HealthStatuses).map((key) => (
                    <SelectItem key={key} value={key}>
                      {HealthStatuses[key as keyof typeof HealthStatuses]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <div className="flex flex-col gap-2">
              <Controller
                name="health_insurance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    value={`${field.value}`}
                    isSelected={!!getValues("health_insurance")}
                    onValueChange={(selected) =>
                      setValue("health_insurance", selected ? "1" : "0")
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
                    {...field}
                    value={`${field.value}`}
                    isSelected={
                      !!getValues("easy_access_to_healthcare_services")
                    }
                    onValueChange={(selected) =>
                      setValue(
                        "easy_access_to_healthcare_services",
                        selected ? "1" : "0"
                      )
                    }
                  >
                    {t("fields.easy_access_to_healthcare_services.label")}
                  </Checkbox>
                )}
              />
              <Controller
                name="more_info"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} label={t("fields.more_info.label")} />
                )}
              />
            </div>
          </Skeleton>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            isDisabled={!isDirty || isSubmitting}
          >
            {t("save")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountCensus;
