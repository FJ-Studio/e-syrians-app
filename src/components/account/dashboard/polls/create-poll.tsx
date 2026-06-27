"use client";
import useCountries from "@/components/hooks/localization/country";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import useGender from "@/components/hooks/localization/gender";
import usePollResultsReveal from "@/components/hooks/localization/poll-results-reveal";
import useProvinces from "@/components/hooks/localization/provinces";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import useServerError from "@/components/hooks/localization/server-errors";
import { MAX_AUDIENCE_AGE, MIN_AUDIENCE_AGE } from "@/lib/constants/census";
import { generateToken } from "@/lib/recaptcha";
import { CreatePollFields } from "@/lib/types/polls";
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
  Textarea,
} from "@heroui/react";
import minusCircleIcon from "@iconify-icons/heroicons/minus-circle";
import plusCircleIcon from "@iconify-icons/heroicons/plus-circle";
import { Icon } from "@iconify/react";
import { parseDate } from "@internationalized/date";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

/**
 * Props for the poll form. The same component drives both
 * create (`mode="create"`, default) and edit (`mode="edit"`, with
 * `pollId` + `initialValues`). Edit mode posts a PATCH to the
 * per-poll proxy; create posts a POST to the index.
 *
 * Edit is only legal while the poll has zero votes (backend
 * enforces it via UpdatePollRequest::authorize); the My Polls
 * table already gates the Edit button on `poll.is_editable`, so
 * this component doesn't re-check at the UI layer — if the user
 * arrives here for a voted poll the backend's 403 surfaces in
 * the toast.
 */
export interface PollFormProps {
  mode?: "create" | "edit";
  pollId?: string;
  initialValues?: Partial<CreatePollFields>;
  initialOptions?: string[];
}

const CreatePoll: FC<PollFormProps> = ({ mode = "create", pollId, initialValues, initialOptions }) => {
  const genderOptions = useGender();
  const provinces = useProvinces();
  const religions = useReligiousAffiliation();
  const ethnicities = useEthnicity();
  const countries = useCountries();
  const revealResultsOptions = usePollResultsReveal();
  const [options, setOptions] = useState<string[]>(
    initialOptions && initialOptions.length >= 2 ? initialOptions : ["", ""],
  );
  const session = useSession();
  const router = useRouter();
  const t = useTranslations("account.dashboard.polls.create");
  const serverError = useServerError();
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    register,
    formState: { isSubmitting },
  } = useForm<CreatePollFields>({
    defaultValues: {
      question: initialValues?.question ?? "",
      start_date: initialValues?.start_date ?? new Date().toISOString().split("T")[0],
      duration: initialValues?.duration ?? "1",
      audience: {
        age_range: {
          max: initialValues?.audience?.age_range?.max ?? MAX_AUDIENCE_AGE,
          min: initialValues?.audience?.age_range?.min ?? MIN_AUDIENCE_AGE,
        },
        country: initialValues?.audience?.country ?? [],
        ethnicity: initialValues?.audience?.ethnicity ?? [],
        gender: initialValues?.audience?.gender ?? [],
        hometown: initialValues?.audience?.hometown ?? [],
        religious_affiliation: initialValues?.audience?.religious_affiliation ?? [],
        province: initialValues?.audience?.province ?? [],
        allowed_voters: initialValues?.audience?.allowed_voters ?? "",
      },
      max_selections: initialValues?.max_selections ?? "1",
      audience_can_add_options: initialValues?.audience_can_add_options ?? "0",
      reveal_results: initialValues?.reveal_results ?? "before-voting",
      voters_are_visible: initialValues?.voters_are_visible ?? "0",
      audience_only: initialValues?.audience_only ?? "0",
    },
  });

  // Subscription-based watchers. Using `useWatch` instead of the form's
  // `watch()` keeps these values compatible with React Compiler memoization.
  const allowedVotersValue = useWatch({ control, name: "audience.allowed_voters" });
  const countryValue = useWatch({ control, name: "audience.country" });

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const userIsNotVerified = !session.data?.user?.verified_at;

  const store = async (data: CreatePollFields) => {
    const isEditMode = mode === "edit";
    const formData = new FormData();
    formData.append("question", data.question);
    // `start_date` is only meaningful on create — for edit, the
    // poll's existing start_date is preserved server-side (the
    // service falls back to `$poll->start_date` when the key is
    // absent and recomputes end_date from existing-start + new
    // duration). Resending the original date for an already-
    // started poll would trip the `after_or_equal:today` rule and
    // 422 the patch, so we omit it entirely in edit mode.
    if (!isEditMode) {
      formData.append("start_date", data.start_date);
    }
    formData.append("duration", data.duration);
    formData.append("max_selections", data.max_selections);
    // Honour the loaded value — the form Select renders the
    // current state and the user expects "Save" to persist
    // whatever they see. Hard-coding "0" was a stale shortcut
    // from when the create UI disabled the picker; edit must
    // round-trip the real value or it silently disables
    // audience-added options.
    formData.append("audience_can_add_options", data.audience_can_add_options);
    formData.append("reveal_results", data.reveal_results);
    formData.append("voters_are_visible", data.voters_are_visible);
    formData.append("audience_only", data.audience_only);
    options.forEach((option) => {
      formData.append("options[]", option);
    });
    // If allowed_voters is specified, send that and skip criteria
    const allowedVotersRaw = (data.audience.allowed_voters ?? "").trim();
    if (allowedVotersRaw) {
      const voters = allowedVotersRaw
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      voters.forEach((voter) => {
        formData.append("allowed_voters[]", voter);
      });
    } else {
      formData.append("min_age", String(data.audience.age_range?.min ?? MIN_AUDIENCE_AGE));
      formData.append("max_age", String(data.audience.age_range?.max ?? MAX_AUDIENCE_AGE));
      const arrayCriteria = [
        "gender",
        "hometown",
        "country",
        "religious_affiliation",
        "ethnicity",
        "province",
      ] as const;
      arrayCriteria.forEach((key) => {
        const values = data.audience[key] ?? [];
        values.forEach((value) => {
          formData.append(`${key}[]`, value);
        });
      });
    }
    try {
      // Recaptcha action name + endpoint diverge per mode. Create
      // hits the FormData POST (multipart-friendly because the
      // original create flow predates JSON bodies); edit hits the
      // dedicated PATCH proxy, which converts the FormData to a
      // plain object server-side so backend validators see the
      // same shape they always have.
      const action = mode === "edit" ? "poll_update" : "poll_store";
      const token = await generateToken(action);
      formData.append("recaptcha_token", token);

      const url = mode === "edit" ? `/api/account/polls/${pollId}` : "/api/account/polls";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, { method, body: formData });
      if (response.ok) {
        toast.success(mode === "edit" ? t("editSuccess", { defaultValue: "Poll updated" }) : t("success"));
        router.push("/account/polls");
      } else {
        const errorData = await response.json();
        const msg = errorData?.messages?.[0];
        if (msg) {
          // Resolve server-error keys (e.g. poll_has_votes_cannot_edit)
          // through the same hook the rest of the dashboard uses;
          // unknown keys fall through to their raw string.
          toast.error(serverError(msg));
        } else {
          toast.error(t("error"));
        }
      }
    } catch {
      // Network error — form submission failed silently
    }
  };
  const isEdit = mode === "edit";
  return (
    <div className="w-full">
      <h2 className="text-default-700 text-xl font-medium">
        {isEdit ? t("editTitle", { defaultValue: "Edit poll" }) : t("title")}
      </h2>
      <p className="text-default-500 mb-6">
        {isEdit
          ? t("editDescription", {
              defaultValue: "Make changes to your poll. Editing is only possible until the first vote is cast.",
            })
          : t("description")}
      </p>
      {userIsNotVerified && (
        <Alert color="danger" className="mb-6">
          {t("accountUnverifiedAlert")}
        </Alert>
      )}
      <form onSubmit={handleSubmit(store)} className="mb-6 space-y-4">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="start_date"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error, invalid } }) => (
              <DatePicker
                {...field}
                value={getValues("start_date") ? parseDate(getValues("start_date")) : undefined}
                defaultValue={getValues("start_date") ? parseDate(getValues("start_date")) : undefined}
                onChange={(date) => (date ? setValue("start_date", date?.toString()) : null)}
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
                value={parseInt(field.value) || undefined}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="max_selections"
            control={control}
            rules={{
              required: t("max_selections.error"),
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <NumberInput
                {...field}
                value={parseInt(field.value) || 1}
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
              // Controlled. The hardcoded `defaultSelectedKeys={["0"]}`
              // ignored the loaded poll value and visually disagreed
              // with what the form would submit; `selectedKeys`
              // binds the Select to react-hook-form so create
              // defaults to "0" and edit reflects the actual poll.
              <Select
                disabledKeys={["1"]}
                label={t("audience_can_add_options.label")}
                isDisabled={userIsNotVerified}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next) field.onChange(String(next));
                }}
              >
                <SelectItem key={"0"} textValue={t("audience_can_add_options.no.label")}>
                  {t("audience_can_add_options.no.label")}
                </SelectItem>
                <SelectItem key={"1"} textValue={t("audience_can_add_options.yes.label")}>
                  {t("audience_can_add_options.yes.label")}
                </SelectItem>
              </Select>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Controller
            name="reveal_results"
            control={control}
            render={({ field }) => (
              // Controlled — `defaultSelectedKeys={["before-voting"]}`
              // overrode the loaded value on edit. Binding to
              // `field.value` lets edit reflect the saved choice
              // (after-voting / after-expiration) and create still
              // starts at "before-voting" via the form defaults.
              <Select
                label={t("reveal_results.label")}
                description={t("reveal_results.description")}
                isDisabled={userIsNotVerified}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next) field.onChange(String(next));
                }}
              >
                {Object.keys(revealResultsOptions).map((key) => (
                  <SelectItem
                    key={key}
                    textValue={revealResultsOptions[key as keyof typeof revealResultsOptions].title}
                  >
                    <div className="">
                      <p>{revealResultsOptions[key as keyof typeof revealResultsOptions].title}</p>
                      <p className="text-tiny text-default-500">
                        {revealResultsOptions[key as keyof typeof revealResultsOptions].description}
                      </p>
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
              // Controlled — see audience_can_add_options comment.
              <Select
                label={t("voters_are_visible.label")}
                isDisabled={userIsNotVerified}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next) field.onChange(String(next));
                }}
              >
                <SelectItem key={"0"} textValue={t("voters_are_visible.no.label")}>
                  {t("voters_are_visible.no.label")}
                </SelectItem>
                <SelectItem key={"1"} textValue={t("voters_are_visible.yes.label")}>
                  {t("voters_are_visible.yes.label")}
                </SelectItem>
              </Select>
            )}
          />
          <Controller
            name="audience_only"
            control={control}
            render={({ field }) => (
              // Controlled — see audience_can_add_options comment.
              <Select
                label={t("audience_only.label")}
                description={t("audience_only.description")}
                isDisabled={userIsNotVerified}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0];
                  if (next) field.onChange(String(next));
                }}
              >
                <SelectItem key={"0"} textValue={t("audience_only.public.label")}>
                  {t("audience_only.public.label")}
                </SelectItem>
                <SelectItem key={"1"} textValue={t("audience_only.audience.label")}>
                  {t("audience_only.audience.label")}
                </SelectItem>
              </Select>
            )}
          />
        </div>

        <h3 className="text-default-700 text-lg font-semibold">{t("options.title")}</h3>

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
                <Button isIconOnly color="danger" onPress={() => removeOption(index)} isDisabled={options.length === 2}>
                  <Icon icon={minusCircleIcon} className="size-6" />
                </Button>
              }
            />
          </div>
        ))}

        <Button
          type="button"
          isDisabled={isSubmitting || userIsNotVerified || options.length >= 100}
          onPress={() => options.length < 100 && setOptions((prev) => [...prev, ""])}
          color="primary"
          startContent={<Icon icon={plusCircleIcon} className="size-6" />}
        >
          {t("options.add")}
        </Button>
        <h3 className="text-default-700 text-lg font-semibold">{t("audience.title")}</h3>
        <Controller
          name="audience.allowed_voters"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              label={t("allowed_voters.label")}
              placeholder={t("allowed_voters.placeholder")}
              description={t("allowed_voters.description")}
              value={field.value ?? ""}
              onValueChange={(value) => {
                field.onChange(value);
                if (value.trim().length > 0) {
                  setValue("audience.gender", []);
                  setValue("audience.hometown", []);
                  setValue("audience.country", []);
                  setValue("audience.religious_affiliation", []);
                  setValue("audience.ethnicity", []);
                  setValue("audience.province", []);
                  setValue("audience.age_range.min", MIN_AUDIENCE_AGE);
                  setValue("audience.age_range.max", MAX_AUDIENCE_AGE);
                }
              }}
            />
          )}
        />
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${(allowedVotersValue ?? "").trim().length > 0 ? "pointer-events-none opacity-50" : ""}`}
        >
          <Controller
            name="audience.gender"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Select
                label={t("gender.label")}
                description={t("gender.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                selectedKeys={field.value ?? []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
              >
                {Object.keys(genderOptions).map((key) => (
                  <SelectItem key={key} textValue={genderOptions[key as keyof typeof genderOptions]}>
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
                label={t("hometown.label")}
                description={t("hometown.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                selectedKeys={field.value ?? []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
              >
                {Object.keys(provinces).map((key) => (
                  <SelectItem key={key} textValue={provinces[key as keyof typeof provinces]}>
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
                label={t("ethnicity.label")}
                description={t("ethnicity.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                selectedKeys={field.value ?? []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
              >
                {Object.keys(ethnicities).map((key) => (
                  <SelectItem key={key} textValue={ethnicities[key as keyof typeof ethnicities]}>
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
                label={t("country.label")}
                selectionMode="multiple"
                description={t("country.description")}
                selectedKeys={field.value ?? []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
              >
                {Object.keys(countries).map((key) => (
                  <SelectItem
                    key={key}
                    textValue={countries[key as keyof typeof countries]}
                    startContent={<Avatar src={`/flags/${key.toLowerCase()}.svg`} className="h-6 w-6" size="sm" />}
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
                label={t("religious_affiliation.label")}
                description={t("religious_affiliation.description")}
                isInvalid={invalid}
                errorMessage={error?.message}
                selectionMode="multiple"
                selectedKeys={field.value ?? []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
              >
                {Object.keys(religions).map((key) => (
                  <SelectItem key={key} textValue={religions[key as keyof typeof religions]}>
                    {religions[key as keyof typeof religions]}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          {(countryValue ?? []).includes("SY") && (
            <Controller
              name="audience.province"
              control={control}
              render={({ field }) => (
                <Select
                  label={t("province.label")}
                  description={t("province.description")}
                  selectionMode="multiple"
                  selectedKeys={field.value ?? []}
                  onSelectionChange={(keys) => field.onChange(Array.from(keys).map(String))}
                >
                  {Object.keys(provinces).map((key) => (
                    <SelectItem key={key} textValue={provinces[key as keyof typeof provinces]}>
                      {provinces[key as keyof typeof provinces]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          )}
          {/* Bound to the form's audience.age_range so edit mode
             reflects the saved targeting; create still falls back
             to MIN/MAX via the form defaults. Slider is
             uncontrolled (no `value` prop) so we use a remount
             `key` keyed on the loaded values — without it,
             switching from a hydrated edit form back to a new
             one would leave the slider stuck on the previous
             poll's range. */}
          <Slider
            key={`age-slider-${initialValues?.audience?.age_range?.min ?? MIN_AUDIENCE_AGE}-${initialValues?.audience?.age_range?.max ?? MAX_AUDIENCE_AGE}`}
            defaultValue={[
              initialValues?.audience?.age_range?.min ?? MIN_AUDIENCE_AGE,
              initialValues?.audience?.age_range?.max ?? MAX_AUDIENCE_AGE,
            ]}
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
                setValue("audience.age_range.min", value[0]);
                setValue("audience.age_range.max", value[1]);
              } else if (!isNaN(value)) {
                setValue("audience.age_range.min", value);
                setValue("audience.age_range.max", value);
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
          {isEdit ? t("editSubmit", { defaultValue: "Save changes" }) : t("submit")}
        </Button>
      </form>
    </div>
  );
};

export default CreatePoll;
