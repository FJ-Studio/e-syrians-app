"use client";

import { Button } from "@heroui/react";
import informationCircleIcon from "@iconify-icons/heroicons/information-circle";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { useEsyrian } from "../shared/contexts/es";

const CensusActions: FC = () => {
  const t = useTranslations("census.actions");
  const esyrian = useEsyrian();
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-center gap-2">
      <Button color="primary" onPress={() => esyrian.openCensusForm(true)}>
        {t("register")}
      </Button>
      <Button
        isIconOnly
        color="primary"
        variant="flat"
        onPress={() => window.open("https://www.e-syrians.com/e-syrians-presentation.pdf", "_blank")}
      >
        <Icon icon={informationCircleIcon} className="text-primary size-6" />
      </Button>
    </div>
  );
};

export default CensusActions;
