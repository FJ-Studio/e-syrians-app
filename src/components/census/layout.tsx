"use client";
import { CENSUS_NAV } from "@/lib/constants/census";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, Fragment, PropsWithChildren } from "react";
import Container from "../shared/container";
import { useEsyrian } from "../shared/contexts/es";

const CensusLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  const { openCensusForm } = useEsyrian();
  return (
    <div className="relative min-h-[calc(100dvh-128px)] pt-20">
      <div className="bg-primary flex h-12 items-center">
        <Container className="mx-auto flex items-center justify-between">
          <div className="text-sm md:text-base">
            {CENSUS_NAV.map((nav, index) => (
              <Fragment key={nav.link}>
                <Link href={nav.link} title={t(nav.title)} className="text-white">
                  {t(nav.title)}
                </Link>
                {index < CENSUS_NAV.length - 1 && <span className="mx-2 text-gray-200">|</span>}
              </Fragment>
            ))}
          </div>
          <button onClick={() => openCensusForm(true)} className="hidden border-0 bg-transparent text-white md:block">
            {t("census.actions.register")}
          </button>
        </Container>
      </div>
      <Container className="pt-8">{children}</Container>
    </div>
  );
};

export default CensusLayout;
