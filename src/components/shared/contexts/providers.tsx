"use client";
import { HeroUIProvider } from "@heroui/react";
import { FC, PropsWithChildren } from "react";
import { Toaster } from "sonner";
import EsyrianProvider from "./es";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <EsyrianProvider>{children}</EsyrianProvider>
      <Toaster position="bottom-left" richColors />
    </HeroUIProvider>
  );
};

export default Providers;
