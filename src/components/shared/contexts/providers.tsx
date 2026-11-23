"use client";
import { ibm } from "@/lib/fonts/fonts";
import { HeroUIProvider } from "@heroui/react";
import { useLocale } from "next-intl";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { FC, PropsWithChildren } from "react";
import { Toaster } from "sonner";
import EsyrianProvider from "./es";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const locale = useLocale();
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      <HeroUIProvider locale={locale}>
        <EsyrianProvider>{children}</EsyrianProvider>
        <Toaster position="bottom-left" richColors toastOptions={{ className: ibm.className }} />
      </HeroUIProvider>
    </NextThemesProvider>
  );
};

export default Providers;
