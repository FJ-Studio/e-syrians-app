"use client";
import { CENSUS_NAV } from "@/lib/constants/census";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FC, Fragment, PropsWithChildren } from "react";
import Container from "../shared/container";

const CensusLayout: FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations();
  return (
    <div className="relative min-h-[calc(100dvh-128px)] pt-20">
      <div className="bg-primary flex h-12 items-center">
        <Container className="mx-auto flex items-center justify-between">
          <div className="text-sm md:text-base">
            {CENSUS_NAV.map((nav, index) => (
              <Fragment key={nav.link}>
                <Link href={nav.link} title={t(nav.title)} className="text-primary-foreground">
                  {t(nav.title)}
                </Link>
                {index < CENSUS_NAV.length - 1 && <span className="text-default-300 mx-2">|</span>}
              </Fragment>
            ))}
          </div>
        </Container>
      </div>
      <Container className="pt-8">{children}</Container>
    </div>
  );
};

export default CensusLayout;
