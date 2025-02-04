"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { login } from "@/app/actions";
import AuthLayout from "./layout";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  // const [loginError, setLoginError] = useState<string | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const t = useTranslations();

  // const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const data = Object.fromEntries(new FormData(e.currentTarget));
  //   try {
  //     // Your login logic here
  //   } catch (error) {
  //     setLoginError(error.message);
  //   }
  // };

  return (
    <AuthLayout>
      {/* Sign Up Form */}
      <div className="flex w-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 p-4">
          <div className="flex flex-col gap-2 w-full">
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
              className="w-full"
              onPress={() =>
                signIn("google", {
                  redirect: true,
                  redirectTo: "/account",
                })
              }
            >
              {t("common.continueWithGoogle")}
            </Button>
            {/* <Button
              startContent={
                <Icon
                  className="text-default-500"
                  icon="heroicons:finger-print-solid"
                  width={24}
                />
              }
              variant="bordered"
              className="w-full"
            >
              {t("common.continueWithPasskey")}
            </Button> */}
          </div>

          <div className="flex items-center gap-4 py-2 w-full ">
            <Divider className="flex-1 w-full" />
            <p className="shrink-0 text-tiny text-default-500">
              {t("common.or")}
            </p>
            <Divider className="flex-1 w-full" />
          </div>
          <Form
            validationBehavior="native"
            className="flex w-full flex-col gap-3"
            // onSubmit={onSubmit}
            action={async (formData) => {
              await login(formData);
            }}
          >
            <Input
              isRequired
              label={t("common.email")}
              name="email"
              // placeholder={t("common.typeEmail")}
              errorMessage={t("common.typeEmail")}
              type="email"
              // variant="underlined"
            />
            <Input
              isRequired
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-bold"
                    />
                  )}
                </button>
              }
              label={t("common.password")}
              name="password"
              // placeholder={t("common.typePassword")}
              errorMessage={t("common.typePassword")}
              type={isVisible ? "text" : "password"}
              // variant="underlined"
            />
            <Checkbox className="py-4" size="sm">
              {t("common.rememberMe")}
            </Checkbox>
            <Button color="primary" type="submit">
              {t("common.login")}
            </Button>
          </Form>
        </div>

        {/* Right side */}
        {/* <div
        className="relative hidden w-1/2 flex-col-reverse p-10 shadow-small lg:flex h-[calc(100dvh-120px)] m-10 rounded-xl"
        style={{
          backgroundImage:
            "url(/syria-1.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-start gap-4">
          <div className="bg-gradient-to-b from-transparent to-black absolute top-0 left-0 h-full w-full"></div>

          <User
            avatarProps={{
              src: "/andre-parrot.jpg",
              alt: t("slogan.author.name"),
              className: "border-2 border-white",
            }}
            classNames={{
              base: "flex flex-row",
              name: "w-full text-start text-white",
              description: "text-white/80",
            }}
            className="z-10"
            description={t("slogan.author.description")}
            name={t("slogan.author.name")}
          />
          <p className="w-full text-start text-2xl text-white z-20">
            <span className="font-medium">“</span>
            <span className="font-normal italic">{t("slogan.text")}</span>
            <span className="font-medium">”</span>
          </p>
          <ul className="flex gap-2 z-20 items-center justify-center w-full">
            {Object.keys(LANGUAGES).map((lang) => (
              <li key={lang}>
                <a
                  className="text-white text-sm underline underline-offset-3"
                  href={`/${lang}`}
                  title={LANGUAGES[lang as Locale].label}
                >
                  {LANGUAGES[lang as Locale].label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div> */}
      </div>
    </AuthLayout>
  );
}
