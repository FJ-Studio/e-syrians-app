"use client";
import { FC, PropsWithChildren } from "react";
import EsyrianProvider from "./es";
import { HeroUIProvider } from "@heroui/react";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <EsyrianProvider>{children}</EsyrianProvider>
    </HeroUIProvider>
  );
};

export default Providers;
