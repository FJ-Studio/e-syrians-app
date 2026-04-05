"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.warn("Account error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <p className="text-default-500 max-w-md">{t("description")}</p>
      <Button color="primary" onPress={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
