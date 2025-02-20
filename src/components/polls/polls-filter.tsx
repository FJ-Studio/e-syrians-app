"use client";
import getYearsMonths from "@/lib/years-months";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC, useState } from "react";

const PollsFilter: FC = () => {
  const t = useTranslations("polls.filter");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const sp = useSearchParams();
  const params = new URLSearchParams(sp.toString());
  const { push } = useRouter();
  const pathname = usePathname();
  const times = getYearsMonths(2024, 1, [
    t("months.january"),
    t("months.february"),
    t("months.march"),
    t("months.april"),
    t("months.may"),
    t("months.june"),
    t("months.july"),
    t("months.august"),
    t("months.september"),
    t("months.october"),
    t("months.november"),
    t("months.december"),
  ]);
  const [selectedYear, setSelectedYear] = useState(
    sp.get("year") || Object.keys(times)[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    sp.get("month") || times[selectedYear][0].index
  );
  return (
    <>
      <Button isIconOnly color="primary" onPress={onOpen}>
        <AdjustmentsHorizontalIcon className="size-6" />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t("title")}</ModalHeader>
              <ModalBody>
                <p>{t("description")}</p>
                <Select
                  label={t("selectYear")}
                  size="sm"
                  defaultSelectedKeys={[selectedYear]}
                  onSelectionChange={(selection) => {
                    setSelectedYear(selection.anchorKey as string);
                  }}
                >
                  {Object.keys(times).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label={t("selectMonth")}
                  defaultSelectedKeys={[selectedMonth]}
                  onSelectionChange={(selection) => {
                    setSelectedMonth(selection.anchorKey as string);
                  }}
                >
                  {times[selectedYear].map((month) => (
                    <SelectItem key={month.index}>{month.name}</SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button fullWidth color="danger" onPress={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  fullWidth
                  color="primary"
                  onPress={() => {
                    params.set("year", selectedYear);
                    params.set("month", selectedMonth);
                    params.set("page", "1");
                    push(`${pathname}?${params.toString()}`);
                    onClose();
                  }}
                >
                  {t("apply")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PollsFilter;
