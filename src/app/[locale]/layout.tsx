import type { Metadata } from "next";
import "../globals.css";
import { Locale } from "@/lib/types/locale";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../../auth";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { GoogleTagManager } from "@next/third-parties/google";
import { ibm } from "@/lib/fonts/fonts";
import Providers from "@/components/shared/contexts/providers";
import Script from "next/script";
import CensusForm from "@/components/census/form";

export const metadata: Metadata = {
  title: "E-SYRIANS Network",
  description:
    "For every Syrian, creating a better homeland and a brighter future.",
  openGraph: {
    title: "E-SYRIANS Network",
    description:
      "For every Syrian, creating a better homeland and a brighter future.",
    images: [
      {
        url: "https://e-syrians.com/e-syrians.jpeg",
        width: 1200,
        height: 630,
        alt: "E-SYRIANS Network",
      },
    ],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <GoogleTagManager gtmId="G-ECLQC58Q2W" />
      <Script
        async
        defer
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA}`}
      ></Script>
      <body className={`${ibm.className} antialiased`}>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <Providers>
              <Header />
              {children}
              <CensusForm />
              <Footer />
            </Providers>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
