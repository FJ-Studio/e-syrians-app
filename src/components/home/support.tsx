"use client";
import { ibm } from "@/lib/fonts";
import { Snippet } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FC } from "react";

const SupportMe: FC = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-2 border-gray-100 border-solid border-2 rounded-lg">
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
