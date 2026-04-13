"use client";
import { ibm } from "@/lib/fonts/fonts";
import { HeroUIProvider } from "@heroui/react";
import { FC, PropsWithChildren } from "react";
import { Toaster } from "sonner";
import EsyrianProvider from "./es";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <EsyrianProvider>{children}</EsyrianProvider>
      <Toaster position="bottom-left" richColors className={ibm.className} />
    </HeroUIProvider>
  );
};

export default Providers;
