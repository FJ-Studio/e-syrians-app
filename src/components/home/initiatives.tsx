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
    <div className="flex flex-col gap-4 md:flex-row md:gap-8 mt-8 flex-wrap">
      {INITIATIVES.map((initiative, index) => (
        <div className="w-full sm:w-1/2 lg:w-[calc(50%-16px)]" key={index}>
          <Card className="p-6">
            <h3 className="text-pretty text-lg font-medium">
              {initiative.title}
            </h3>
            <p className="mt-4 text-gray-500">{initiative.description}</p>
            {initiative.link ? (
              <Button
                as={Link}
                href={initiative.link}
                className="mt-4 bg-primary text-white"
              >
                {t("common.read_more")}
              </Button>
            ) : (
              <Button
                className="mt-4 bg-primary text-white/20"
                disabled
                disableAnimation
                disableRipple
              >
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
