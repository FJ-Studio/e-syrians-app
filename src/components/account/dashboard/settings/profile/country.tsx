import useCountries from "@/components/hooks/localization/country";
import useProvinces from "@/components/hooks/localization/provinces";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { CountryCode } from "@/lib/types/misc";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { FC, Key, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type UpdateAddressProps = {
  user?: ESUser;
};

interface AddressFields {
  country: CountryCode;
  province: string;
  /**
   * Optional street/mailing address. Stored encrypted server-side,
   * owner-only on UserResource. Collected at registration too —
   * exposing it here closes the edit-parity gap so users can
   * update it without going through the Census form.
   */
  address: string;
}

const AccountAddress: FC<UpdateAddressProps> = ({ user }) => {
  const locale = useLocale();
  const t = useTranslations("account.settings.address");
  const tSettings = useTranslations("account.settings");
  const provinces = useProvinces();
  const serverError = useServerError();
  const countries = useCountries();
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<AddressFields>({
    defaultValues: {
      country: user?.country ?? undefined,
      province: user?.province ?? undefined,
      address: user?.address ?? "",
    },
  });

  const countryValue = useWatch({ control, name: "country" });

  useEffect(() => {
    if (user) {
      reset({
        country: user?.country ?? undefined,
        province: user?.province ?? undefined,
        address: user?.address ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async (data: AddressFields) => {
    const token = await generateToken("update_address");
    const response = await fetch("/api/account/profile/update/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
      },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
    });
    const result = await response.json();
    if (response.status === 200) {
      toast.success(t("update.success"));
    } else {
      toast.error(result.messages?.[0] ? serverError(result.messages[0]) : extractErrors(result.messages)[0]);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b-default-200 dark:border-b-default-100 bg-default-50 flex flex-col items-start gap-1 border-b">
        <h2 className="text-default-700 text-lg font-medium">{t("title")}</h2>
        <p className="text-default-500 text-sm">{t("description")}</p>
      </CardHeader>
      <CardBody>
        <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col items-start space-y-4">
          <Controller
            name="country"
            control={control}
            rules={{ required: tSettings("validation.required") }}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                label={t("fields.country.label")}
                isRequired
                classNames={{
                  clearButton: "hidden",
                }}
                scrollShadowProps={{
                  isEnabled: false,
                }}
                isInvalid={invalid}
                errorMessage={error?.message}
                value={field.value ?? null}
                onBlur={field.onBlur}
                onChange={(selected: Key | null) => {
                  setValue("country", (selected?.toString() ?? "") as CountryCode, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
                description={<p className="text-start">{t("fields.country.description")}</p>}
              >
                {Object.keys(countries).map((country) => (
                  <AutocompleteItem
                    key={country}
                    textValue={countries[country as keyof typeof countries]}
                    startContent={<Avatar src={`/flags/${country.toLowerCase()}.svg`} className="h-6 w-6" size="sm" />}
                  >
                    {countries[country as keyof typeof countries]}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          />
          {countryValue === "SY" && (
            <Controller
              name="province"
              control={control}
              rules={{ required: tSettings("validation.required") }}
              render={({ field, fieldState: { error, invalid } }) => (
                <Autocomplete
                  label={t("fields.province.label")}
                  isRequired
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  value={field.value ?? null}
                  onBlur={field.onBlur}
                  onChange={(selected: Key | null) => {
                    setValue("province", selected?.toString() ?? "", {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  classNames={{ clearButton: "hidden" }}
                >
                  {Object.keys(provinces).map((key) => (
                    <AutocompleteItem key={key} textValue={provinces[key as keyof typeof provinces]}>
                      {provinces[key as keyof typeof provinces]}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
              )}
            />
          )}
          {/* Optional street/mailing address. Encrypted backend-side,
           *  owner-only on UserResource. Collected at registration —
           *  exposing it here so the address form has parity with what
           *  the signup wizard captures. */}
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={t("fields.address.label")}
                description={<p className="text-start">{t("fields.address.description")}</p>}
                classNames={{ description: "flex items-start" }}
                maxLength={255}
              />
            )}
          />
          <Button color="primary" type="submit" isLoading={isSubmitting} isDisabled={!isDirty || isSubmitting}>
            {t("save")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default AccountAddress;
