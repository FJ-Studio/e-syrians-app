"use client";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import useGender from "@/components/hooks/localization/gender";
import useProvinces from "@/components/hooks/localization/provinces";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
  SharedSelection,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateBasicProfileDataProps = {
  user?: ESUser;
};

type BasicDataFields = ESUser & {
  confirmation: string;
};

const UpdateBasicProfileData: FC<UpdateBasicProfileDataProps> = ({ user }) => {
  const genderOptions = useGender();
  const hometownOptions = useProvinces();
  const ethnicityOptions = useEthnicity();
  const t = useTranslations("account.settings");
  const serverError = useServerError();
  const {
    handleSubmit,
    getValues,
    setValue,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<BasicDataFields>({
    defaultValues: user
      ? {
          name: user?.name ?? "",
          surname: user?.surname ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          gender: user?.gender ?? undefined,
          birth_date: user?.birth_date ?? "",
          hometown: user?.hometown ?? undefined,
          ethnicity: user?.ethnicity ?? undefined,
          national_id: user?.national_id ?? "",
          record_id: user?.record_id ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user?.name ?? "",
        surname: user?.surname ?? "",
        gender: user?.gender ?? undefined,
        birth_date: user?.birth_date ?? undefined,
        hometown: user?.hometown ?? undefined,
        ethnicity: user?.ethnicity ?? undefined,
        national_id: user?.national_id ?? "",
        record_id: user?.record_id ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async (data: BasicDataFields) => {
    try {
      const token = await generateToken("update_basic");
      const response = await fetch("/api/account/profile/update/basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, recaptcha_token: token }),
      });
      if (response.status === 200) {
        toast.success(t("update.success"));
      } else {
        const result = await response.json();
        toast.error(serverError(result.messages?.[0] ?? ""));
      }
    } catch {
      toast.error(t(serverError("unknown_error")));
    }
  };

  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h3 className="text-default-700 text-lg font-medium">{t("basicData.title")}</h3>
        <p className="text-default-500 text-sm">{t("basicData.description")}</p>
      </CardHeader>
      <CardBody>
        <form className="flex w-full flex-col items-start gap-4" onSubmit={handleSubmit(save)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} type="text" label={t("fields.name.label")} />}
          />
          <Controller
            name="surname"
            control={control}
            render={({ field }) => <Input {...field} type="text" label={t("fields.surname.label")} />}
          />
          <Controller
            name="birth_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                classNames={{
                  label: "flex items-start",
                }}
                value={getValues("birth_date") ? parseDate(getValues("birth_date") as string) : null}
                defaultValue={getValues("birth_date") ? parseDate(getValues("birth_date") as string) : null}
                onChange={(date) => (date ? setValue("birth_date", date?.toString()) : null)}
                label={t("fields.birth_date.label")}
                showMonthAndYearPickers
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
                selectedKeys={getValues("gender") ? [getValues("gender") as string] : []}
                onSelectionChange={(selectedKeys: SharedSelection) => {
                  setValue("gender", selectedKeys.anchorKey as keyof typeof genderOptions);
                }}
              >
                {Object.keys(genderOptions).map((key) => (
                  <SelectItem key={key}>{genderOptions[key as keyof typeof genderOptions]}</SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="ethnicity"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                {...field}
                label={t("fields.ethnicity.label")}
                isRequired
                isInvalid={invalid}
                errorMessage={error?.message}
                value={(getValues("ethnicity") as string) ?? ""}
                onChange={(selected: React.Key | null) => {
                  setValue("ethnicity", selected?.toString() as keyof typeof ethnicityOptions);
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(ethnicityOptions).map((key) => (
                  <AutocompleteItem key={key}>
                    {ethnicityOptions[key as keyof typeof ethnicityOptions]}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          <Controller
            name="hometown"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                {...field}
                label={t("fields.hometown.label")}
                isRequired
                isInvalid={invalid}
                errorMessage={error?.message}
                value={(getValues("hometown") as string) ?? ""}
                onChange={(selected: React.Key | null) => {
                  setValue("hometown", selected?.toString() as keyof typeof hometownOptions);
                }}
                classNames={{ clearButton: "hidden" }}
              >
                {Object.keys(hometownOptions).map((key) => (
                  <AutocompleteItem key={key}>{hometownOptions[key as keyof typeof hometownOptions]}</AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          <Controller
            name="national_id"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={t("national_id.label")}
                description={t("national_id.description")}
                classNames={{
                  description: "flex items-start",
                }}
              />
            )}
          />
          <Controller
            name="record_id"
            control={control}
            render={({ field }) => <Input {...field} label={t("record_id.label")} />}
          />
          <div className="flex flex-col items-start gap-4 pt-2">
            <Controller
              name="confirmation"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Checkbox {...field} isRequired value={"1"} classNames={{ label: "text-sm" }}>
                  {t("profile.confirmation")}
                </Checkbox>
              )}
            />
            <Button color="primary" type="submit" isDisabled={isSubmitting} isLoading={isSubmitting}>
              {t("profile.save")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdateBasicProfileData;
