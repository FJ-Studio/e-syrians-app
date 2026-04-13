"use client";
import Container from "@/components/shared/container";
import { Accordion, AccordionItem, Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC, PropsWithChildren } from "react";

const MainTag: FC<PropsWithChildren<{ home?: boolean }>> = ({ children, home }) => {
  if (home) {
    return <h2 className="text-default-700 text-3xl font-semibold">{children}</h2>;
  }
  return <h1 className="text-default-700 text-3xl font-semibold">{children}</h1>;
};

const FaqTag: FC<PropsWithChildren<{ home?: boolean }>> = ({ children, home }) => {
  if (home) {
    return <h3 className="text-default-800 text-lg font-medium">{children}</h3>;
  }
  return <h2 className="text-default-800 text-lg font-medium">{children}</h2>;
};

const Faq: FC<{ home?: boolean }> = ({ home = false }) => {
  const t = useTranslations("faq");
  return (
    <Container className="py-28 text-start">
      <MainTag home={home}>{t("title")}</MainTag>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <FaqTag>{t("general.title")}</FaqTag>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem className="items-start text-start" title={t("general.q1.title")}>
                  {t("general.q1.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("general.q2.title")}>
                  {t("general.q2.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("general.q3.title")}>
                  {t("general.q3.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("general.q6.title")}>
                  {t("general.q6.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("general.q4.title")}>
                  {t("general.q4.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("general.q5.title")}>
                  {t("general.q5.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <FaqTag>{t("account.title")}</FaqTag>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem className="items-start text-start" title={t("account.q1.title")}>
                  {t("account.q1.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q2.title")}>
                  {t("account.q2.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q8.title")}>
                  {t("account.q8.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q3.title")}>
                  {t("account.q3.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q4.title")}>
                  {t("account.q4.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q5.title")}>
                  {t("account.q5.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q6.title")}>
                  {t("account.q6.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("account.q7.title")}>
                  {t("account.q7.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <FaqTag>{t("security.title")}</FaqTag>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem className="items-start text-start" title={t("security.q1.title")}>
                  {t("security.q1.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("security.q2.title")}>
                  {t("security.q2.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("security.q3.title")}>
                  {t("security.q3.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("security.q4.title")}>
                  {t("security.q4.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("security.q5.title")}>
                  {t("security.q5.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <FaqTag>{t("polls.title")}</FaqTag>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem className="items-start text-start" title={t("polls.q1.title")}>
                  {t("polls.q1.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("polls.q2.title")}>
                  {t("polls.q2.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("polls.q3.title")}>
                  {t("polls.q3.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("polls.q4.title")}>
                  {t("polls.q4.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("polls.q5.title")}>
                  {t("polls.q5.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("polls.q6.title")}>
                  {t("polls.q6.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <FaqTag>{t("donations.title")}</FaqTag>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem className="items-start text-start" title={t("donations.q1.title")}>
                  {t("donations.q1.description")}
                </AccordionItem>
                <AccordionItem className="items-start text-start" title={t("donations.q2.title")}>
                  {t("donations.q2.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Faq;
