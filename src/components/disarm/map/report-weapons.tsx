"use client";
import { WEAPONS } from "@/lib/constants";
import { WeaponDeliveryForm } from "@/lib/types/weapon-delivery";
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Modal,
  ModalContent,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

const ReportWeapons: FC = () => {
  const locale = useLocale();
  const t = useTranslations();
  const session = useSession();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose,
  } = useDisclosure();
  const sp = useSearchParams();
  useEffect(() => {
    if (session.status === "authenticated" && sp.get("report") === "1") {
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<WeaponDeliveryForm>({
    defaultValues: {
      name: session.data?.user?.name || "",
      surname: session.data?.user?.surname || "",
      national_id: "",
      weapons: "",
      notes: "",
      address: "",
      phone: "",
    },
  });
  const onSubmit = async (data: WeaponDeliveryForm) => {
    try {
      const res = await axios.post("/api/disarm/report", data, {
        headers: {
          Authorization: `Bearer ${session.data?.user?.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
      });
      if (res.status === 201) {
        reset();
        onClose();
        onFeedbackOpen();
      } else {
        console.error(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Button
        variant="solid"
        color="primary"
        onPress={() => {
          if (session.status === "authenticated") {
            onOpen();
          } else {
            signIn("google", { callbackUrl: "/disarm?report=1" });
          }
        }}
      >
        {t("disarm.i_have_weapon")}
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        classNames={{
          base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2  rounded-medium",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>{t("disarm.i_have_weapon")}</DrawerHeader>
              <DrawerBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="w-full flex flex-col gap-4"
                >
                  <Controller
                    name="national_id"
                    control={control}
                    rules={{
                      required: true,
                      minLength: 11,
                      maxLength: 11,
                      pattern: /^[0-9\u0660-\u0669]+$/,
                    }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isInvalid={invalid}
                        isRequired
                        type="text"
                        // placeholder={t("disarm.report.national_id.description")}
                        label={t("disarm.report.national_id.title")}
                        errorMessage={error?.message}
                        description={t("disarm.report.national_id.explanation")}
                      />
                    )}
                  />
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true, minLength: 2 }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="text"
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        // placeholder={t("disarm.report.name.description")}
                        label={t("disarm.report.name.title")}
                      />
                    )}
                  />
                  <Controller
                    name="surname"
                    control={control}
                    rules={{ required: true, minLength: 2 }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="text"
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        // placeholder={t("disarm.report.surname.description")}
                        label={t("disarm.report.surname.title")}
                      />
                    )}
                  />
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: true, minLength: 5 }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="text"
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        // placeholder={t("disarm.report.address.description")}
                        label={t("disarm.report.address.title")}
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: true,
                      minLength: 10,
                      maxLength: 15,
                      pattern: /^[0-9\u0660-\u0669]+$/,
                    }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Input
                        {...field}
                        isRequired
                        type="text"
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        // placeholder={t("disarm.report.address.description")}
                        label={t("disarm.report.phone.title")}
                      />
                    )}
                  />
                  <div className="flex items-center gap-4 py-2 w-full ">
                    <Divider className="flex-1 w-full" />
                    <p className="shrink-0 text-default-500">
                      {t("disarm.report.weapons_list")}
                    </p>
                    <Divider className="flex-1 w-full" />
                  </div>
                  <Controller
                    name="weapons"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Select
                        isRequired
                        selectionMode="multiple"
                        {...field}
                        isInvalid={invalid}
                        label={t("disarm.report.weapons_list")}
                        errorMessage={error?.message}
                        description={t(
                          "disarm.report.weapons_list_description"
                        )}
                      >
                        {WEAPONS.map((weapon) => (
                          <SelectItem key={weapon} value={weapon}>
                            {t(`disarm.weapons.${weapon}`)}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="notes"
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <Textarea
                        {...field}
                        isRequired
                        isInvalid={invalid}
                        errorMessage={error?.message}
                        className="w-full"
                        label={t("disarm.report.notes.title")}
                        placeholder={t("disarm.report.notes.description")}
                      />
                    )}
                  />
                </form>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="solid" onPress={onClose}>
                  {t("common.close")}
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  disabled={isSubmitting}
                  onPress={() => handleSubmit(onSubmit)()}
                >
                  {isSubmitting ? t("common.sending_data") : t("common.submit")}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <Modal isDismissable isOpen={isFeedbackOpen} onClose={onFeedbackClose}>
        <ModalContent>
          <div className="p-6">
            <p className="mb-1 font-bold text-lg">
              {t("disarm.report.received.title")}
            </p>
            <p>{t("disarm.report.received.description")} 💚</p>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReportWeapons;
