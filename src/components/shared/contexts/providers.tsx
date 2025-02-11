"use client";
import { FC, PropsWithChildren } from "react";
import EsyrianProvider from "./es";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sonner";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <EsyrianProvider>{children}</EsyrianProvider>
      <Toaster position="bottom-left" richColors />
    </HeroUIProvider>
  );
};

export default Providers;
