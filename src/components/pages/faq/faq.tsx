"use client";
import Container from "@/components/shared/container";
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

const Faq: FC = () => {
  const t = useTranslations("faq");
  return (
    <Container className="py-28 text-start">
      <h1 className="text-3xl font-semibold text-default-700">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-default-800">
                {t("general.title")}
              </h2>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q1.title")}
                >
                  {t("general.q1.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q2.title")}
                >
                  {t("general.q2.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q3.title")}
                >
                  {t("general.q3.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q6.title")}
                >
                  {t("general.q6.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q4.title")}
                >
                  {t("general.q4.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("general.q5.title")}
                >
                  {t("general.q5.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-default-800">
                {t("account.title")}
              </h2>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q1.title")}
                >
                  {t("account.q1.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q2.title")}
                >
                  {t("account.q2.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q8.title")}
                >
                  {t("account.q8.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q3.title")}
                >
                  {t("account.q3.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q4.title")}
                >
                  {t("account.q4.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q5.title")}
                >
                  {t("account.q5.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q6.title")}
                >
                  {t("account.q6.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("account.q7.title")}
                >
                  {t("account.q7.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-default-800">
                {t("security.title")}
              </h2>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem
                  className="items-start text-start"
                  title={t("security.q1.title")}
                >
                  {t("security.q1.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("security.q2.title")}
                >
                  {t("security.q2.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("security.q3.title")}
                >
                  {t("security.q3.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("security.q4.title")}
                >
                  {t("security.q4.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("security.q5.title")}
                >
                  {t("security.q5.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-default-800">
                {t("polls.title")}
              </h2>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q1.title")}
                >
                  {t("polls.q1.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q2.title")}
                >
                  {t("polls.q2.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q3.title")}
                >
                  {t("polls.q3.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q4.title")}
                >
                  {t("polls.q4.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q5.title")}
                >
                  {t("polls.q5.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("polls.q6.title")}
                >
                  {t("polls.q6.description")}
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-default-800">
                {t("donations.title")}
              </h2>
            </CardHeader>
            <CardBody>
              <Accordion variant="light">
                <AccordionItem
                  className="items-start text-start"
                  title={t("donations.q1.title")}
                >
                  {t("donations.q1.description")}
                </AccordionItem>
                <AccordionItem
                  className="items-start text-start"
                  title={t("donations.q2.title")}
                >
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
