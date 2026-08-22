"use client";
import AudienceForm from "@/components/account/dashboard/audiences/audience-form";
import useCountries from "@/components/hooks/localization/country";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import useGender from "@/components/hooks/localization/gender";
import usePollResultsReveal from "@/components/hooks/localization/poll-results-reveal";
import useProvinces from "@/components/hooks/localization/provinces";
import useReligiousAffiliation from "@/components/hooks/localization/religious_affiliation";
import useServerError from "@/components/hooks/localization/server-errors";
import useMyAudiences from "@/components/hooks/use-my-audiences";
import { MAX_AUDIENCE_AGE, MIN_AUDIENCE_AGE } from "@/lib/constants/census";
import { generateToken } from "@/lib/recaptcha";
import { Audience } from "@/lib/types/audience";
import { CreatePollFields, PollAudienceMode } from "@/lib/types/polls";
import {
  Alert,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  SliderValue,
  useDisclosure,
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
  const initialAudienceMode = initialValues?.audience_mode ?? "demographics";
  const initialWasSavedList = mode === "edit" && initialAudienceMode === "saved_list";
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
      },
      audience_mode: initialAudienceMode,
      audience_uuid: initialValues?.audience_uuid ?? undefined,
      max_selections: initialValues?.max_selections ?? "1",
      audience_can_add_options: initialValues?.audience_can_add_options ?? "0",
      reveal_results: initialValues?.reveal_results ?? "before-voting",
      voters_are_visible: initialValues?.voters_are_visible ?? "0",
      audience_only: initialValues?.audience_only ?? "0",
    },
  });

  const myAudiences = useMyAudiences();

  // "Create audience" modal opened from the saved-list picker.
  // Rendering the audience-form inside a Modal keeps this whole
  // poll-form mounted while the user creates a new list — the
  // previous "Create new" Link navigated away to /account/audiences/new
  // and threw away every in-progress field.
  const {
    isOpen: isAudienceModalOpen,
    onOpen: openAudienceModal,
    onOpenChange: onAudienceModalOpenChange,
    onClose: closeAudienceModal,
  } = useDisclosure();

  const handleAudienceCreated = (created: Audience) => {
    // Optimistic prepend so the Autocomplete has the new row on
    // its next render; a background refetch reconciles with the
    // server list. Auto-select the freshly-created audience so
    // the user doesn't have to pick it manually after the modal
    // closes.
    myAudiences.pushAudience(created);
    setValue("audience_uuid", created.uuid);
    closeAudienceModal();
    myAudiences.refetch();
  };

  // Subscription-based watchers. Using `useWatch` instead of the form's
  // `watch()` keeps these values compatible with React Compiler memoization.
  const countryValue = useWatch({ control, name: "audience.country" });
  const audienceMode = useWatch({ control, name: "audience_mode" }) ?? "demographics";
  const audienceUuidValue = useWatch({ control, name: "audience_uuid" });

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
    // Audience payload: the two modes are mutually exclusive at the
    // backend layer, so we forward ONLY the fields the active mode
    // needs. Mixing saved-list and demographic fields would trip
    // StorePollRequest::withValidator.
    const activeAudienceMode: PollAudienceMode = data.audience_mode ?? "demographics";
    if (activeAudienceMode === "saved_list") {
      if (!data.audience_uuid) {
        toast.error(t("audience.saved_list.required"));
        return;
      }
      formData.append("audience_uuid", data.audience_uuid);
    } else {
      if (initialWasSavedList) {
        // Empty string is converted to null by the edit proxy so the
        // backend detaches an existing saved audience when the user
        // switches back to demographics.
        formData.append("audience_uuid", "");
      }
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
          name="audience_mode"
          control={control}
          render={({ field }) => (
            <RadioGroup
              orientation="horizontal"
              value={field.value ?? "demographics"}
              onValueChange={(next) => {
                const nextMode = next as PollAudienceMode;
                field.onChange(nextMode);
                // Clear the other mode's state so the FormData
                // builder only serialises the active mode's fields.
                if (nextMode !== "saved_list") {
                  setValue("audience_uuid", undefined);
                }
                if (nextMode !== "demographics") {
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
            >
              <Radio value="demographics">{t("audience.modes.demographics")}</Radio>
              <Radio value="saved_list">{t("audience.modes.saved_list")}</Radio>
            </RadioGroup>
          )}
        />
        {audienceMode === "saved_list" ? (
          <div className="space-y-2">
            {myAudiences.error ? (
              // Load failure — surface it here instead of letting
              // the user hit Submit and see an opaque "choose a
              // saved audience" validation error. The retry button
              // calls the hook's refetch() so the network path is
              // re-exercised without unmounting the form.
              <Alert color="danger" className="mb-2">
                <div className="flex flex-col items-start gap-2">
                  <span>{t("audience.saved_list.loadError")}</span>
                  <Button size="sm" variant="flat" color="danger" onPress={myAudiences.refetch}>
                    {t("audience.saved_list.retry")}
                  </Button>
                </div>
              </Alert>
            ) : myAudiences.isEmpty ? (
              <Alert color="warning" className="mb-2">
                <div className="flex flex-col items-start gap-2">
                  <span>{t("audience.saved_list.empty")}</span>
                  <Button size="sm" variant="flat" color="primary" onPress={openAudienceModal}>
                    {t("audience.saved_list.createLink")}
                  </Button>
                </div>
              </Alert>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                {/*
                  Autocomplete gets `flex-1` — NOT `w-full` — so it
                  grows to fill the row without pushing the "Create
                  new" button outside the container's right edge on
                  desktop. `min-w-0` lets it shrink below its
                  content's intrinsic width inside a flex row.
                */}
                <Controller
                  name="audience_uuid"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      className="min-w-0 flex-1"
                      label={t("audience.saved_list.label")}
                      description={t("audience.saved_list.description")}
                      isLoading={myAudiences.loading}
                      selectedKey={field.value ?? null}
                      defaultItems={myAudiences.audiences}
                      onSelectionChange={(key) => field.onChange(key ? String(key) : undefined)}
                    >
                      {(audience) => (
                        <AutocompleteItem
                          key={audience.uuid}
                          textValue={audience.name}
                          description={t("audience.saved_list.counts", {
                            resolved: audience.entries_resolved_count,
                            total: audience.entries_total_count,
                          })}
                        >
                          {audience.name}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                />
                {/*
                  Iconify's <Icon> doesn't reliably inherit Tailwind
                  `size-*` on the wrapping <svg>; setting `width` /
                  `height` explicitly guarantees the glyph renders
                  at 20px. `flex-shrink-0` keeps the whole button
                  from being squeezed on narrow rows.
                */}
                <Button
                  type="button"
                  onPress={openAudienceModal}
                  variant="flat"
                  color="primary"
                  className="shrink-0"
                  startContent={<Icon icon={plusCircleIcon} width={20} height={20} />}
                >
                  {t("audience.saved_list.createLink")}
                </Button>
              </div>
            )}
            {audienceUuidValue ? (
              <p className="text-default-500 text-xs">{t("audience.saved_list.selectedHint")}</p>
            ) : null}
          </div>
        ) : null}
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${audienceMode !== "demographics" ? "hidden" : ""}`}
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

      {/*
        Inline "Create audience" modal. Rendered here (not inside
        the form) because forms can't legally contain other forms —
        Modal portals its content out of the DOM tree at render
        time so it doesn't submit the outer form when the user
        presses Enter in the inner form. `AudienceForm` receives
        `onCreated` + `onCancel` so it doesn't router.push() away
        and destroy the poll draft.
      */}
      <Modal isOpen={isAudienceModalOpen} onOpenChange={onAudienceModalOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>{t("audience.saved_list.createModalTitle")}</ModalHeader>
              <ModalBody className="pb-6">
                <AudienceForm mode="create" onCreated={handleAudienceCreated} onCancel={close} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CreatePoll;
