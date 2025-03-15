"use client";
import useGender from "@/components/hooks/localization/gender";
import { ESUser } from "@/lib/types/account";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import {
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
  Skeleton,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import useProvinces from "@/components/hooks/localization/provinces";
import useEthnicity from "@/components/hooks/localization/ethnicity";
import { toast } from "sonner";
import useServerError from "@/components/hooks/localization/server-errors";
import { generateToken } from "@/lib/recaptcha";

type UpdateBasicProfileDataProps = {
  user?: ESUser;
};

type BasicDataFields = ESUser & {
  confirmation: string;
};

const UpdateBasicProfileData: FC<UpdateBasicProfileDataProps> = ({ user }) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
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
        setMode("view");
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
      <CardHeader className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-lg text-default-700 font-medium">
            {t("basicData.title")}
          </h3>
          {mode === "view" && (user?.basic_info_updates ?? 0) > 0 && (
            <Skeleton isLoaded={!!user} className="rounded-lg">
              <Button
                onPress={() => setMode("edit")}
                startContent={<PencilSquareIcon className="size-4" />}
                size="sm"
                variant="flat"
              >
                {t("profile.edit")}
              </Button>
            </Skeleton>
          )}
        </div>
        <p>{t("basicData.description")}</p>
      </CardHeader>
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit(save)}>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label={t("fields.name.label")}
                  isReadOnly={mode === "view"}
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="surname"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label={t("fields.surname.label")}
                  isReadOnly={mode === "view"}
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="birth_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={
                    getValues("birth_date")
                      ? parseDate(getValues("birth_date") as string)
                      : null
                  }
                  defaultValue={
                    getValues("birth_date")
                      ? parseDate(getValues("birth_date") as string)
                      : null
                  }
                  onChange={(date) =>
                    date ? setValue("birth_date", date?.toString()) : null
                  }
                  label={t("fields.birth_date.label")}
                  isReadOnly={mode === "view"}
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
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
                    setValue(
                      "gender",
                      selectedKeys.anchorKey as keyof typeof genderOptions
                    );
                  }}
                  isDisabled={mode === "view"}
                >
                  {Object.keys(genderOptions).map((key) => (
                    <SelectItem key={key} value={key}>
                      {genderOptions[key as keyof typeof genderOptions]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
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
                  selectedKeys={getValues("ethnicity") ? [getValues("ethnicity") as string] : []}
                  onSelectionChange={(selectedKeys: SharedSelection) => {
                    setValue(
                      "ethnicity",
                      selectedKeys.anchorKey as keyof typeof ethnicityOptions
                    );
                  }}
                  isDisabled={mode === "view"}
                >
                  {Object.keys(ethnicityOptions).map((key) => (
                    <SelectItem key={key} value={key}>
                      {ethnicityOptions[key as keyof typeof ethnicityOptions]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
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
                  selectedKeys={getValues("hometown") ? [getValues("hometown") as string] : []}
                  onSelectionChange={(selectedKeys: SharedSelection) => {
                    setValue(
                      "hometown",
                      selectedKeys.anchorKey as keyof typeof hometownOptions
                    );
                  }}
                  isDisabled={mode === "view"}
                >
                  {Object.keys(hometownOptions).map((key) => (
                    <SelectItem key={key} value={key}>
                      {hometownOptions[key as keyof typeof hometownOptions]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="national_id"
              control={control}
              render={({ field }) => (
                <Input
                  label={t("national_id.label")}
                  description={t("national_id.description")}
                  {...field}
                  isReadOnly={mode === "view"}
                />
              )}
            />
          </Skeleton>
          <Skeleton isLoaded={!!user} className="rounded-lg">
            <Controller
              name="record_id"
              control={control}
              render={({ field }) => (
                <Input
                  label={t("record_id.label")}
                  {...field}
                  isReadOnly={mode === "view"}
                />
              )}
            />
          </Skeleton>
          {mode === "edit" && (
            <>
              <Controller
                name="confirmation"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Checkbox {...field} isRequired value={"1"}>
                    {t("profile.confirmation")}
                  </Checkbox>
                )}
              />
              <Button
                color="primary"
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {t("profile.save")}
              </Button>
            </>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdateBasicProfileData;
