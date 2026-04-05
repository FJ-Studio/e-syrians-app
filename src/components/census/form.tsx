"use client";

import { toast } from "sonner";
import { FC, useEffect, useState } from "react";
import { useEsyrian } from "../shared/contexts/es";
import { useForm } from "react-hook-form";
import { RegistrationForm } from "@/lib/types/census";
import { useTranslations } from "next-intl";
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
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  useDisclosure,
} from "@heroui/react";
import confetti from "canvas-confetti";
import extractErrors from "@/lib/extract-errors";
import { generateToken } from "@/lib/recaptcha";
import { getUrl } from "@/lib/user";
import { ESUser } from "@/lib/types/account";
import { signOut, useSession } from "next-auth/react";

import AccountInfoSection from "./form/sections/account-info";
import PersonalDataSection from "./form/sections/personal-data";
import CountryLocationSection from "./form/sections/country-location";
import EducationSection from "./form/sections/education";
import EmploymentSection from "./form/sections/employment";
import HealthSection from "./form/sections/health";
import MoreInfoSection from "./form/sections/more-info";

const LOCAL_STORAGE_KEY = "CENSUS_FORM_DATA";

// ---------------------------------------------------------------------------
// FormData builder — serialises RegistrationForm for the API
// ---------------------------------------------------------------------------

function buildFormData(data: RegistrationForm): FormData {
  const formData = new FormData();
  const arrayFields = new Set(["other_nationalities", "languages"]);
  const booleanFields = new Set([
    "health_insurance",
    "easy_access_to_healthcare_services",
    "shelter",
  ]);

  for (const key of Object.keys(data) as (keyof RegistrationForm)[]) {
    if (!data[key]) continue;

    if (arrayFields.has(key)) {
      const values = ((data[key] ?? "") as string).split(",");
      values.forEach((v) => formData.append(`${key}[]`, v));
    } else if (booleanFields.has(key)) {
      formData.append(key, (data[key] as boolean) ? "1" : "0");
    } else {
      formData.append(key, data[key] as string);
    }
  }
  return formData;
}

// ---------------------------------------------------------------------------
// CensusForm
// ---------------------------------------------------------------------------

const CensusForm: FC = () => {
  const session = useSession();
  const [uuid, setUuid] = useState<string | null>(
    session.data?.user?.uuid ?? null
  );
  const {
    isOpen,
    onOpen: onOpenLinkModal,
    onOpenChange: onOpenLinkModalchange,
  } = useDisclosure();

  const { censusFormIsOpened, openCensusForm, updateCensusStats } =
    useEsyrian();
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

  // Persist form data to localStorage
  const watchedValues = watch();
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  const register = async (registrationData: RegistrationForm) => {
    if (registrationData.password !== registrationData.password_confirmation) {
      toast.error(t("passwordMismatch"));
      setError("password_confirmation", {
        type: "manual",
        message: t("passwordMismatch"),
      });
      return;
    }

    const formData = buildFormData(registrationData);

    try {
      const token = await generateToken("register_census");
      formData.append("recaptcha_token", token);

      const res = await fetch("/api/census/register", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const json = await res.json();

      if (res.ok && res.status === 201) {
        setUuid(json.data.uuid);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });

        reset(
          Object.keys(watchedValues).reduce(
            (acc, key) => ({ ...acc, [key]: "" }),
            {}
          )
        );
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        openCensusForm(false);
        onOpenLinkModal();
        window.setTimeout(() => updateCensusStats(), 1000);
      } else {
        toast.error(
          extractErrors(json.messages).map((p) => <p key={p}>{p}</p>)
        );
      }
    } catch {
      toast.error(t("error"));
    }
  };

  const closeDrawer = () => openCensusForm(false);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
          if (!open) closeDrawer();
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>{t("title")}</DrawerHeader>
              <DrawerBody>
                {session.status === "authenticated" ? (
                  <div className="w-full">
                    <p className="font-medium">{t("alreadySignedIn")}</p>
                    <p>{t("alreadySignedInDescription")}</p>
                  </div>
                ) : (
                  <>
                    <p>{t("description")}</p>
                    <Divider />
                    <form
                      onSubmit={handleSubmit(register)}
                      className="space-y-4"
                    >
                      <AccountInfoSection control={control} t={t} />
                      <PersonalDataSection
                        control={control}
                        getValues={getValues}
                        setValue={setValue}
                        t={t}
                      />
                      <CountryLocationSection
                        control={control}
                        getValues={getValues}
                        setValue={setValue}
                        t={t}
                      />
                      <EducationSection
                        control={control}
                        getValues={getValues}
                        t={t}
                      />
                      <EmploymentSection
                        control={control}
                        getValues={getValues}
                        t={t}
                      />
                      <HealthSection
                        control={control}
                        getValues={getValues}
                        setValue={setValue}
                        t={t}
                      />
                      <MoreInfoSection control={control} t={t} />
                    </form>
                  </>
                )}
              </DrawerBody>
              <DrawerFooter>
                {session.status === "authenticated" ? (
                  <>
                    <Button
                      fullWidth
                      color="primary"
                      variant="solid"
                      onPress={onOpenLinkModal}
                    >
                      {t("profile.link")}
                    </Button>
                    <Button color="danger" fullWidth onPress={() => signOut()}>
                      {t("signOut")}
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Success modal with profile link */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenLinkModalchange}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t("profile.link")}</ModalHeader>
              <ModalBody>
                <p>{t("profile.copy")} 🥳</p>
                <Input
                  value={getUrl({ uuid } as ESUser)}
                  readOnly
                  endContent={
                    <Snippet
                      hideSymbol
                      codeString={getUrl({ uuid } as ESUser)}
                      size="sm"
                      variant="flat"
                      className="translate-x-2"
                      classNames={{ base: "bg-transparent" }}
                      disableTooltip
                    />
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose} fullWidth color="danger">
                  {t("close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CensusForm;
