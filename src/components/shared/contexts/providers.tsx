"use client";
import { FC, PropsWithChildren } from "react";
import EsyrianProvider from "./es";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sonner";
import { ibm } from "@/lib/fonts/fonts";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <EsyrianProvider>{children}</EsyrianProvider>
      <Toaster position="bottom-left" richColors className={ibm.className} />
    </HeroUIProvider>
  );
};

export default Providers;
