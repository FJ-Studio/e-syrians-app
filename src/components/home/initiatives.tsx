"use client";
import { Button, Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC } from "react";
import useInitiatives from "../hooks/localization/initiatives";

const Initiatives: FC = () => {
  const t = useTranslations();
  const INITIATIVES = useInitiatives();
  return (
    <div className="mt-8 flex flex-col flex-wrap gap-4 md:flex-row md:gap-8">
      {INITIATIVES.map((initiative, index) => (
        <div className="w-full sm:w-1/2 lg:w-[calc(50%-16px)]" key={index}>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-pretty">{initiative.title}</h3>
            <p className="text-default-500 mt-4">{initiative.description}</p>
            {initiative.link ? (
              <Button as={Link} href={initiative.link} className="bg-primary text-primary-foreground mt-4">
                {t("common.read_more")}
              </Button>
            ) : (
              <Button className="bg-primary text-primary-foreground/20 mt-4" disabled disableAnimation disableRipple>
                {t("common.preparing")}
              </Button>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default Initiatives;
