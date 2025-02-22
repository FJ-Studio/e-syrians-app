"use client";
import { FC, Fragment, PropsWithChildren } from "react";
import { CENSUS_NAV } from "@/lib/constants/census";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEsyrian } from "../shared/contexts/es";
import Container from "../shared/container";

const CensusLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  const { openCensusForm } = useEsyrian();
  return (
    <div className="min-h-[calc(100dvh-128px)] relative pt-20">
      <div className="bg-primary h-12 flex items-center">
        <Container className="mx-auto flex items-center justify-between">
          <div className="text-sm md:text-base">
            {CENSUS_NAV.map((nav, index) => (
              <Fragment key={nav.link}>
                <Link
                  href={nav.link}
                  title={t(nav.title)}
                  className="text-white"
                >
                  {t(nav.title)}
                </Link>
                {index < CENSUS_NAV.length - 1 && (
                  <span className="mx-2 text-gray-200">|</span>
                )}
              </Fragment>
            ))}
          </div>
          <button
            onClick={() => openCensusForm(true)}
            className="text-white bg-transparent border-0 hidden md:block"
          >
            {t("census.actions.register")}
          </button>
        </Container>
      </div>
      <Container className="pt-8">{children}</Container>
    </div>
  );
};

export default CensusLayout;
