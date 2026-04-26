import CensusForm from "@/components/census/form";
import Providers from "@/components/shared/contexts/providers";
import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";
import { routing } from "@/i18n/routing";
import { ibm } from "@/lib/fonts/fonts";
import { Locale } from "@/lib/types/locale";
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { auth } from "../../../auth";
import "../globals.css";

export const metadata: Metadata = {
  title: "E-SYRIANS Network",
  description: "For every Syrian, creating a better homeland and a brighter future.",
  openGraph: {
    title: "E-SYRIANS Network",
    description: "For every Syrian, creating a better homeland and a brighter future.",
    images: [
      {
        url: "https://www.e-syrians.com/e-syrians.jpeg",
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
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-MSXHDMVL" />
      <body className={`${ibm.className} antialiased`}>
        {/*
         * reCAPTCHA v3 loader. Kept inside <body> so Next.js' Script manager
         * can reliably place it; earlier versions put this as a bare sibling
         * of <body> where React 19 hoisting occasionally loaded it late,
         * causing `generateToken` to run against an uninitialised stub and
         * return an empty token (rejected by the backend as invalid).
         */}
        <Script
          id="recaptcha-v3"
          strategy="afterInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA}`}
        />
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
