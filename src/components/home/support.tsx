"use client";
import { ibm } from "@/lib/fonts/fonts";
import { Snippet } from "@heroui/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FC } from "react";

const SupportMe: FC = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="rounded-lg border-2 border-solid border-gray-100 p-2">
        <Image src="/btc-qr.png" alt="Support me" width={150} height={150} />
      </div>
      <Snippet
        hideSymbol
        variant="bordered"
        classNames={{
          pre: `${ibm.className}`,
        }}
        codeString="bc1qvdncnznvrj0s5v48j3uje0x0dhd6qr4audrlztudnwvtlrg4uc7qa7czxs"
      >
        {t("home.support.copy_btc_address")}
      </Snippet>
    </div>
  );
};

export default SupportMe;
