"use client";
import { toast } from "sonner";
import { FC, useEffect } from "react";
import { useEsyrian } from "../shared/contexts/es";
import { Controller, useForm } from "react-hook-form";
import { RegistrationForm } from "@/lib/types/census";
import { useTranslations } from "next-intl";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import useGender from "../hooks/localization/gender";

import { parseDate } from "@internationalized/date";
import useProvinces from "../hooks/localization/provinces";
import useReligiousAffiliation from "../hooks/localization/religious_affiliation";
import useEthnicity from "../hooks/localization/ethnicity";
import useCountries from "../hooks/localization/country";
import useEducationLevels from "../hooks/localization/education";
import useSpokenLanguages from "../hooks/localization/languages";
import useSourceOfIncome from "../hooks/localization/income";
import useHealthStatuses from "../hooks/localization/health";
import confetti from "canvas-confetti";
import extractErrors from "@/lib/extract-errors";

const LOCAL_STORAGE_KEY = "CENSUS_FORM_DATA";

const CensusForm: FC = () => {
  const { censusFormIsOpened, openCensusForm } = useEsyrian();
  const genderOptions = useGender();
  const provinces = useProvinces();
  const ethnicities = useEthnicity();
  const countries = useCountries();
  const religions = useReligiousAffiliation();
  const educationLevels = useEducationLevels();
  const spokenLanguages = useSpokenLanguages();
  const incomeSources = useSourceOfIncome();
  const HealthStatuses = useHealthStatuses();
  const t = useTranslations("census.form");

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    setError,
    formState: { isSubmitting },
  } = useForm<RegistrationForm>({
    defaultValues: async () => {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    },
  });

  const watchedValues = watch();
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  const register = async (registrationData: RegistrationForm) => {
    if (registrationData.password !== registrationData.password_confirmation) {
      toast.error(t("passwordMismatch"));
      setError("password_confirmation", {
        type: "manual",
        message: t("passwordMismatch"),
      });
      return;
    }
    const formData = new FormData();
    Object.keys(registrationData).forEach((key) => {
      if (!!registrationData[key as keyof RegistrationForm]) {
        switch (key) {
          case "other_nationalities":
          case "languages":
            const splitted = (
              (registrationData[key as keyof RegistrationForm] ?? "") as string
            )?.split(",");
            splitted.forEach((value: string) => {
              formData.append(`${key}[]`, value);
            });
            break;
          case "health_insurance":
          case "easy_access_to_healthcare_services":
          case "shelter":
            formData.append(
              key,
              (registrationData[key as keyof RegistrationForm] as boolean)
                ? "1"
                : "0"
            );
            break;
          default:
            formData.append(
              key,
              registrationData[key as keyof RegistrationForm] as string
            );
            break;
        }
      }
    });
    try {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA as string, {
              action: "census_register",
            })
            .then(resolve)
            .catch(reject);
        });
      });
      formData.append("recaptcha_token", token);
      const res = await fetch("/api/census/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        if (res.status === 201) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }, // Confetti starts from the middle
          });
          toast.success(t("success"));
          reset(
            Object.keys(watchedValues).reduce(
              (acc, key) => ({ ...acc, [key]: "" }),
              {}
            )
          );
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          openCensusForm(false);
        }
      } else {
        toast.error(
          extractErrors(json.messages).map((p) => <p key={p}>{p}</p>)
        );
      }
    } catch (error) {
      toast.error(t("error"));
      console.error(error);
    }
  };

  const closeDrawer = () => {
    openCensusForm(false);
  };

  return (
    <>
      <Drawer
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        classNames={{
          base: "data-[placement=right]:m-2 data-[placement=left]:m-2 max-w-[calc(100%-16px)] md:max-w-md rounded-medium",
        }}
        isOpen={censusFormIsOpened}
        onOpenChange={(open) => {
          if (!open) {
            closeDrawer();
          }
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>{t("title")}</DrawerHeader>
              <DrawerBody>
                <p>{t("description")}</p>
                <Divider />
                <form onSubmit={handleSubmit(register)} className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      1. {t("sections.accountInfo.title")}
                    </h3>
                    <p>{t("sections.accountInfo.description")}</p>
                  </div>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isRequired
                        label={t("fields.email.label")}
                        placeholder={t("fields.email.placeholder")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-zA-Z]).{6,}$/,
                    }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="password"
                        label={t("fields.password.label")}
                        placeholder={t("fields.password.placeholder")}
                        description={t("fields.password.description")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />

                  <Controller
                    name="password_confirmation"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="password"
                        label={t("fields.passwordConfirmation.label")}
                        placeholder={t(
                          "fields.passwordConfirmation.placeholder"
                        )}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      2. {t("sections.peronalData.title")}
                    </h3>
                    <p>{t("sections.peronalData.description")}</p>
                  </div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Input
                        {...field}
                        isRequired
                        label={t("fields.name.label")}
                        placeholder={t("fields.name.placeholder")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />
                  <Controller
                    name="middle_name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} label={t("fields.middlename.label")} />
                    )}
                  />
                  <Controller
                    name="surname"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Input
                        {...field}
                        isRequired
                        label={t("fields.surname.label")}
                        placeholder={t("fields.surname.placeholder")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Select
                        {...field}
                        label={t("fields.gender.label")}
                        isRequired
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        defaultSelectedKeys={[getValues("gender")]}
                      >
                        {Object.keys(genderOptions).map((key) => (
                          <SelectItem key={key} value={key}>
                            {genderOptions[key as keyof typeof genderOptions]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="birth_date"
                    control={control}
                    rules={{ required: true }}
                    render={({ fieldState: { error, invalid } }) => (
                      <DatePicker
                        showMonthAndYearPickers
                        inert={true}
                        value={
                          getValues("birth_date")
                            ? parseDate(getValues("birth_date"))
                            : null
                        }
                        defaultValue={
                          getValues("birth_date")
                            ? parseDate(getValues("birth_date"))
                            : null
                        }
                        onChange={(date) =>
                          date ? setValue("birth_date", date?.toString()) : null
                        }
                        isRequired
                        label={t("fields.birth_date.label")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                      />
                    )}
                  />
                  <Controller
                    name="hometown"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Select
                        {...field}
                        label={t("fields.hometown.label")}
                        isRequired
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        defaultSelectedKeys={[getValues("hometown")]}
                        description={t("fields.hometown.description")}
                      >
                        {Object.keys(provinces).map((key) => (
                          <SelectItem key={key} value={key}>
                            {provinces[key as keyof typeof provinces]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="ethnicity"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Select
                        {...field}
                        label={t("fields.ethnicity.label")}
                        isRequired
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        defaultSelectedKeys={[getValues("ethnicity")]}
                      >
                        {Object.keys(ethnicities).map((key) => (
                          <SelectItem key={key} value={key}>
                            {ethnicities[key as keyof typeof ethnicities]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
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
                        defaultSelectedKeys={[
                          getValues("religious_affiliation"),
                        ]}
                        description={t(
                          "fields.religious_affiliation.description"
                        )}
                      >
                        {Object.keys(religions).map((key) => (
                          <SelectItem key={key} value={key}>
                            {religions[key as keyof typeof religions]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Select
                        scrollShadowProps={{
                          isEnabled: false,
                        }}
                        {...field}
                        label={t("fields.country.label")}
                        isRequired
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        defaultSelectedKeys={[getValues("country")]}
                        description={t("fields.country.description")}
                      >
                        {Object.keys(countries).map((key) => (
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

                  <div>
                    <h3 className="font-semibold text-lg">
                      3. {t("sections.censusData.title")}
                    </h3>
                    <p>{t("sections.censusData.description")}</p>
                  </div>
                  <Controller
                    name="national_id"
                    control={control}
                    //   rules={{ required: true }}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Input
                        {...field}
                        label={t("fields.national_id.label")}
                        placeholder={t("fields.national_id.placeholder")}
                        errorMessage={error?.message}
                        isInvalid={invalid}
                        description={t("fields.national_id.description")}
                      />
                    )}
                  />
                  <Controller
                    name="record_id"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t("fields.record_id.label")}
                        description={t("fields.record_id.description")}
                      />
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
                        defaultSelectedKeys={
                          getValues("other_nationalities")
                            ? getValues("other_nationalities").split(",")
                            : undefined
                        }
                        selectionMode="multiple"
                        description={t(
                          "fields.other_nationalities.description"
                        )}
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
                  <div>
                    <h3 className="font-semibold text-lg">
                      4. {t("sections.locationData.title")}
                    </h3>
                    <p>{t("sections.locationData.description")}</p>
                  </div>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t("fields.city.label")}
                        description={t("fields.city.description")}
                      />
                    )}
                  />
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t("fields.address.label")}
                        description={t("fields.address.description")}
                      />
                    )}
                  />
                  <Controller
                    name="shelter"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        value={`${field.value}`}
                        isSelected={!!getValues("shelter")}
                        onValueChange={(selected) =>
                          setValue("shelter", selected)
                        }
                      >
                        {t("fields.shelter.label")}
                      </Checkbox>
                    )}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      4. {t("sections.education.title")}
                    </h3>
                  </div>
                  <Controller
                    name="education_level"
                    control={control}
                    render={({ field, fieldState: { error, invalid } }) => (
                      <Select
                        {...field}
                        label={t("fields.education_level.label")}
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        defaultSelectedKeys={[getValues("education_level")]}
                      >
                        {Object.keys(educationLevels).map((key) => (
                          <SelectItem key={key} value={key}>
                            {
                              educationLevels[
                                key as keyof typeof educationLevels
                              ]
                            }
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
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
                        defaultSelectedKeys={
                          getValues("languages")
                            ? getValues("languages").split(",")
                            : undefined
                        }
                      >
                        {Object.keys(spokenLanguages).map((key) => (
                          <SelectItem key={key} value={key}>
                            {
                              spokenLanguages[
                                key as keyof typeof spokenLanguages
                              ]
                            }
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} label={t("fields.skills.label")} />
                    )}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      5. {t("sections.employment.title")}
                    </h3>
                  </div>
                  <Controller
                    name="source_of_income"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label={t("fields.source_of_income.label")}
                        defaultSelectedKeys={[getValues("source_of_income")]}
                      >
                        {Object.keys(incomeSources).map((key) => (
                          <SelectItem key={key} value={key}>
                            {incomeSources[key as keyof typeof incomeSources]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
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

                  <div>
                    <h3 className="font-semibold text-lg">
                      6. {t("sections.health.title")}
                    </h3>
                  </div>
                  <Controller
                    name="health_status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label={t("fields.health_status.label")}
                        defaultSelectedKeys={[getValues("health_status")]}
                      >
                        {Object.keys(HealthStatuses).map((key) => (
                          <SelectItem key={key} value={key}>
                            {HealthStatuses[key as keyof typeof HealthStatuses]}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />

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
                            setValue("health_insurance", selected)
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
                              selected
                            )
                          }
                        >
                          {t("fields.easy_access_to_healthcare_services.label")}
                        </Checkbox>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      7. {t("sections.more_info.title")}
                    </h3>
                  </div>
                  <Controller
                    name="more_info"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label={t("fields.more_info.label")}
                        placeholder={t("fields.more_info.placeholder")}
                      />
                    )}
                  />
                </form>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  fullWidth
                  color="danger"
                  variant="solid"
                  onPress={onClose}
                  isLoading={isSubmitting}
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  fullWidth
                  color="primary"
                  variant="solid"
                  onPress={() => handleSubmit(register)()}
                  isLoading={isSubmitting}
                >
                  {t("actions.register")}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CensusForm;
