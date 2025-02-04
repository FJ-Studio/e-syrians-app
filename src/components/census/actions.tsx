"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { useEsyrian } from "../shared/contexts/es";

const CensusActions: FC = () => {
  const t = useTranslations("census.actions");
  const esyrian = useEsyrian();
  return (
    <div className="sticky bottom-4 flex items-center justify-center gap-2">
      <Button color="primary" onPress={() => esyrian.openCensusForm(true)}>
        {t("register")}
      </Button>
      <Button isIconOnly color="primary" variant="flat">
        <InformationCircleIcon className="size-6 text-primary" />
      </Button>
    </div>
  );
};

export default CensusActions;
