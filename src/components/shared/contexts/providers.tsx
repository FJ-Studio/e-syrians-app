"use client";
import { ibm } from "@/lib/fonts/fonts";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { FC, PropsWithChildren } from "react";
import { Toaster } from "sonner";
import EsyrianProvider from "./es";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      <HeroUIProvider>
        <EsyrianProvider>{children}</EsyrianProvider>
        <Toaster position="bottom-left" richColors toastOptions={{ className: ibm.className }} />
      </HeroUIProvider>
    </NextThemesProvider>
  );
};

export default Providers;
