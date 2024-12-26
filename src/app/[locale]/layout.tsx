import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { Locale } from "@/lib/types";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../../auth";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { GoogleTagManager } from "@next/third-parties/google";

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "E-SYRIANS Network",
  description: "For every Syrian, creating a better homeland and a brighter future.",
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
      <body className={`${ibm.className} antialiased`}>
      <SessionProvider session={session}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </SessionProvider>
      </body>
    </html>
  );
}
