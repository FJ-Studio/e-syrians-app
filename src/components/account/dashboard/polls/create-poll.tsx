"use client";
// import { CreatePollFields } from "@/lib/types/polls";
import {
  Alert,
  Avatar,
  Button,
  DatePicker,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Slider,
  SliderValue,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { CreatePollFields, PollAudience } from "@/lib/types/polls";
import useGender from "@/components/hooks/localization/gender";
import useProvinces from "@/components/hooks/localization/provinces";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import useCountries from "@/components/hooks/localization/country";
import { toast } from "sonner";
import { generateToken } from "@/lib/recaptcha";
import { MAX_AUDIENCE_AGE, MIN_AUDIENCE_AGE } from "@/lib/constants/census";
import usePollResultsReveal from "@/components/hooks/localization/poll-results-reveal";

const CreatePoll: FC = () => {
  const genderOptions = useGender();
  const provinces = useProvinces();
  const religions = useReligiousAffiliation();
  const ethnicities = useEthnicity();
  const countries = useCountries();
  const revealResultsOptions = usePollResultsReveal();
  const [options, setOptions] = useState<string[]>(["", ""]);
  const session = useSession();
  const t = useTranslations("account.dashboard.polls.create");
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    register,
    formState: { isSubmitting },
  } = useForm<CreatePollFields>({
    defaultValues: {
      question: "",
      start_date: new Date().toISOString().split("T")[0],
      duration: "1",
      audience: {
        age_range: {
          max: MAX_AUDIENCE_AGE.toString(),
          min: MIN_AUDIENCE_AGE.toString(),
        },
        country: "",
        ethnicity: "",
        gender: "",
        hometown: "",
        religious_affiliation: "",
      },
      max_selections: "1",
      audience_can_add_options: "0",
      reveal_results: "before-voting",
      voters_are_visible: "0",
    },
  });

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const userIsNotVerified = !session.data?.user.verified_at;

  const store = async (data: CreatePollFields) => {
    const formData = new FormData();
    formData.append("question", data.question);
    formData.append("start_date", data.start_date);
    formData.append("duration", data.duration);
    formData.append("max_selections", data.max_selections);
    formData.append("audience_can_add_options", "0");
    formData.append("reveal_results", data.reveal_results);
    formData.append("voters_are_visible", data.voters_are_visible);
    options.forEach((option) => {
      formData.append("options[]", option);
    });
    formData.append("min_age", data.audience.age_range?.min ?? "");
    formData.append("max_age", data.audience.age_range?.max ?? "");
    [
      "gender",
      "hometown",
      "country",
      "religious_affiliation",
      "ethnicity",
    ].forEach((key) => {
      if (data.audience[key as keyof PollAudience]) {
        const opts = (
          (data.audience[key as keyof PollAudience] as unknown as string) ?? ""
        ).split(",");
        opts.forEach((opt: string) => {
          formData.append(`${key}[]`, opt);
        });
      }
    });
    try {
      const token = await generateToken("poll_store");
      formData.append("recaptcha_token", token);
      const response = await fetch("/api/account/polls", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast.success(t("success"));
      } else {
        // Error
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-default-700">{t("title")}</h2>
      <p className="text-default-500 mb-6">{t("description")}</p>
      {userIsNotVerified && (
        <Alert color="danger" className="mb-6">
          {t("accountUnverifiedAlert")}
        </Alert>
      )}
      <form onSubmit={handleSubmit(store)} className="space-y-4 mb-6">
        <Controller
          name="question"
          control={control}
          rules={{
            required: t("question.error"),
            minLength: 10,
            maxLength: 255,
          }}
          render={({ field, fieldState: { error, invalid } }) => (
            <Input
              {...field}
              isRequired
              label={t("question.label")}
              placeholder={t("question.placeholder")}
              errorMessage={error?.message}
              isInvalid={invalid}
              isDisabled={userIsNotVerified}
            />
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="start_date"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error, invalid } }) => (
              <DatePicker
                {...field}
                value={
                  getValues("start_date")
                    ? parseDate(getValues("start_date"))
                    : undefined
                }
                defaultValue={
                  getValues("start_date")
                    ? parseDate(getValues("start_date"))
                    : undefined
                }
                onChange={(date) =>
                  date ? setValue("start_date", date?.toString()) : null
                }
                isRequired
                label={t("start_date.label")}
                minValue={parseDate(new Date().toISOString().split("T")[0])}
                description={t("start_date.description")}
                errorMessage={error?.message}
                isInvalid={invalid}
                isDisabled={userIsNotVerified}
              />
            )}
          />
          <Controller
            name="duration"
            control={control}
            rules={{
              required: t("duration.error"),
              pattern: /^[0-9]+$/,
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <NumberInput
                {...field}
                value={parseInt(getValues("duration"))}
                isRequired
                label={t("duration.label")}
                description={t("duration.placeholder")}
                errorMessage={error?.message}
                isInvalid={invalid}
                isDisabled={userIsNotVerified}
                minValue={1}
                maxValue={366}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="max_selections"
            control={control}
            rules={{
              required: t("max_selections.error"),
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <NumberInput
                {...field}
                value={parseInt(getValues("max_selections"))}
                isRequired
                label={t("max_selections.label")}
                description={t("max_selections.description")}
                errorMessage={error?.message}
                isInvalid={invalid}
                isDisabled={userIsNotVerified}
                defaultValue={1}
                minValue={1}
                maxValue={10}
              />
            )}
          />
          <Controller
            name="audience_can_add_options"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                disabledKeys={["1"]}
                label={t("audience_can_add_options.label")}
                isDisabled={userIsNotVerified}
                defaultSelectedKeys={["0"]}
              >
                <SelectItem key={"0"}>
                  {t("audience_can_add_options.no.label")}
                </SelectItem>
                <SelectItem key={"1"}>
                  {t("audience_can_add_options.yes.label")}
                </SelectItem>
              </Select>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="reveal_results"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label={t("reveal_results.label")}
                description={t("reveal_results.description")}
                defaultSelectedKeys={["before-voting"]}
                isDisabled={userIsNotVerified}
              >
                {Object.keys(revealResultsOptions).map((key) => (
                  <SelectItem key={key} textValue={revealResultsOptions[key as keyof typeof revealResultsOptions]
                    .title}>
                    <div className="">
                      <p>{revealResultsOptions[key as keyof typeof revealResultsOptions]
                      .title}</p>
                      <p className="text-tiny text-default-500">{revealResultsOptions[key as keyof typeof revealResultsOptions]
                      .description}</p>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="voters_are_visible"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label={t("voters_are_visible.label")}
                isDisabled={userIsNotVerified}
                defaultSelectedKeys={["0"]}
              >
                <SelectItem key={"0"}>
                  {t("voters_are_visible.no.label")}
                </SelectItem>
                <SelectItem key={"1"}>
                  {t("voters_are_visible.yes.label")}
                </SelectItem>
              </Select>
            )}
          />
        </div>

        <h3 className="font-semibold text-lg text-default-700">
          {t("options.title")}
        </h3>

        {options.map((opt, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              {...register(`options.${index}` as const, { required: true })}
              label={t("options.label", { index: index + 1 })}
              isRequired
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              endContent={
                <Button
                  isIconOnly
                  color="danger"
                  onPress={() => removeOption(index)}
                  isDisabled={options.length === 2}
                >
                  <MinusCircleIcon className="size-6" />
                </Button>
              }
            />
          </div>
        ))}

        <Button
          type="button"
          isDisabled={
            isSubmitting || userIsNotVerified || options.length >= 100
          }
          onPress={() =>
            options.length < 100 && setOptions((prev) => [...prev, ""])
          }
          color="primary"
          startContent={<PlusCircleIcon className="size-6" />}
        >
          {t("options.add")}
        </Button>
        <h3 className="font-semibold text-lg text-default-700">
          {t("audience.title")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Controller
            name="audience.gender"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Select
                {...field}
                label={t("gender.label")}
                description={t("gender.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                value={field.value || []}
              >
                {Object.keys(genderOptions).map((key) => (
                  <SelectItem key={key}>
                    {genderOptions[key as keyof typeof genderOptions]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="audience.hometown"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Select
                {...field}
                label={t("hometown.label")}
                description={t("hometown.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                value={field.value || []}
              >
                {Object.keys(provinces).map((key) => (
                  <SelectItem key={key}>
                    {provinces[key as keyof typeof provinces]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="audience.ethnicity"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Select
                {...field}
                label={t("ethnicity.label")}
                description={t("ethnicity.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                value={field.value || []}
              >
                {Object.keys(ethnicities).map((key) => (
                  <SelectItem key={key}>
                    {ethnicities[key as keyof typeof ethnicities]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="audience.country"
            control={control}
            render={({ field }) => (
              <Select
                scrollShadowProps={{
                  isEnabled: false,
                }}
                {...field}
                label={t("country.label")}
                selectionMode="multiple"
                description={t("country.description")}
                value={field.value || []}
              >
                {Object.keys(countries).map((key) => (
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
                    {countries[key as keyof typeof countries]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="audience.religious_affiliation"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Select
                {...field}
                label={t("religious_affiliation.label")}
                description={t("religious_affiliation.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                value={field.value || []}
              >
                {Object.keys(religions).map((key) => (
                  <SelectItem key={key}>
                    {religions[key as keyof typeof religions]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <Slider
            defaultValue={[MIN_AUDIENCE_AGE, MAX_AUDIENCE_AGE]}
            getValue={(value) => {
              if (Array.isArray(value) && value.length === 2) {
                if (value[1] === MAX_AUDIENCE_AGE) {
                  return [value[0].toString(), `${value[1]}+`].join(" - ");
                }
                return value.map((v) => v.toString()).join(" - ");
              }
              return value.toString();
            }}
            maxValue={MAX_AUDIENCE_AGE}
            minValue={MIN_AUDIENCE_AGE}
            step={1}
            label={t("age_range.label")}
            onChange={(value: SliderValue) => {
              if (Array.isArray(value)) {
                setValue("audience.age_range.min", value?.[0].toString());
                setValue("audience.age_range.max", value?.[1].toString());
              } else if (!isNaN(value)) {
                setValue("audience.age_range.min", value.toString());
                setValue("audience.age_range.max", value.toString());
              }
            }}
          />
        </div>
        <Button
          type="button"
          onPress={() => handleSubmit(store)()}
          isDisabled={isSubmitting || userIsNotVerified}
          isLoading={isSubmitting}
          color="primary"
        >
          {t("submit")}
        </Button>
      </form>
    </div>
  );
};

export default CreatePoll;
