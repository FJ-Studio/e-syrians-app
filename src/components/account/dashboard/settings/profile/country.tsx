import useCountries from "@/components/hooks/localization/country";
import useProvinces from "@/components/hooks/localization/provinces";
import useServerError from "@/components/hooks/localization/server-errors";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { ESUser } from "@/lib/types/account";
import { CountryCode } from "@/lib/types/misc";
import {
  // Autocomplete,
  // AutocompleteItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateAddressProps = {
  user?: ESUser;
};

interface AddressFields {
  country: CountryCode;
  city_inside_syria: string;
}

const AccountAddress: FC<UpdateAddressProps> = ({ user }) => {
  const t = useTranslations("account.settings.address");
  const provinces = useProvinces();
  const serverError = useServerError();
  const countries = useCountries();
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<AddressFields>({
    defaultValues: {
      country: user?.country ?? undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        country: user?.country ?? undefined,
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
      },
      body: JSON.stringify({ ...data, recaptcha_token: token }),
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
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium">{t("title")}</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(save)} className="space-y-4">
          <Skeleton isLoaded={!!user} className="rounded-lg">
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
                  selectedKeys={[getValues("country")]}
                  onSelectionChange={(selected) => {
                    setValue("country", selected.anchorKey as CountryCode);
                  }}
                  description={t("fields.country.description")}
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
                // <Autocomplete
                //   {...field}
                //   label={t("fields.country.label")}
                //   isRequired
                //   classNames={{
                //     clearButton: "hidden",
                //   }}
                //   scrollShadowProps={{
                //     isEnabled: false,
                //   }}
                //   isInvalid={invalid}
                //   errorMessage={error?.message}
                //   selectedKey={getValues("country")}
                //   onSelectionChange={(selected) => {
                //     setValue("country", selected?.toString() as CountryCode);
                //   }}
                //   description={t("fields.country.description")}
                // >
                //   {Object.keys(countries).map((country) => (
                //     <AutocompleteItem
                //       key={country}
                //       value={country}
                //       startContent={
                //         <Avatar
                //           src={`/flags/${country.toLowerCase()}.svg`}
                //           className="w-6 h-6"
                //           size="sm"
                //         />
                //       }
                //     >
                //       {countries[country as keyof typeof countries]}
                //     </AutocompleteItem>
                //   ))}
                // </Autocomplete>
              )}
            />
            {getValues("country") === "SY" && (
              <Controller
                name="city_inside_syria"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Select
                    {...field}
                    label={t("fields.city_inside_syria.label")}
                    isRequired
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    defaultSelectedKeys={[getValues("city_inside_syria")]}
                  >
                    {Object.keys(provinces).map((key) => (
                      <SelectItem key={key} >
                        {provinces[key as keyof typeof provinces]}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            )}
          </Skeleton>
          <Button
            color="primary"
            type="submit"
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

export default AccountAddress;
