"use client";
import { FC, useEffect } from "react";
import BarChartCard from "@/components/charts/bar-chart";
import { useTranslations } from "next-intl";
import { Select, SelectItem } from "@heroui/react";
import { useEsyrian } from "@/components/shared/contexts/es";

const CensusCharts: FC = () => {
  const t = useTranslations("census.charts");
  const { censusStats: charts, updateCensusStats } = useEsyrian();

  useEffect(() => {
    updateCensusStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-x-6 gap-y-12 lg:grid-cols-2">
      <BarChartCard
        title={t("dailyRegistrations.title")}
        description={t("dailyRegistrations.description")}
        color="primary"
        categories={["registered", "verified"]}
        categoriesLabels={[
          t("labels.registered.title"),
          t("labels.verification.title"),
        ]}
        chartData={Object.entries(charts?.daily_users ?? {}).map(
          ([month, value]) => {
            return {
              month,
              registered: value.registered,
              verified: value.verified,
            };
          }
        )}
        actions={
          <div className="flex items-center justify-end gap-x-2">
            <Select
              aria-label="group by"
              classNames={{
                trigger: "min-w-[100px] min-h-7 h-7",
                value: "text-tiny !text-default-500",
                selectorIcon: "text-default-500",
                popoverContent: "min-w-[120px]",
              }}
              defaultSelectedKeys={["per-day"]}
              listboxProps={{
                itemClasses: {
                  title: "text-tiny",
                },
              }}
              placeholder="Per Day"
              size="sm"
              disabledKeys={["per-month"]}
            >
              <SelectItem key="per-day">{t("charts.filter.perday")}</SelectItem>
              <SelectItem key="per-month">
                {t("charts.filter.permonth")}
              </SelectItem>
            </Select>
          </div>
        }
      />
      <BarChartCard
        unit={t("age.unit")}
        title={t("age.title")}
        description={t("age.description")}
        color="primary"
        categories={["verified", "unverified"]}
        categoriesLabels={[
          t("labels.verified.title"),
          t("labels.unverified.title"),
        ]}
        chartData={Object.entries(charts?.age ?? {}).map(([month, value]) => {
          return {
            month,
            unverified: value.unverified,
            verified: value.verified,
          };
        })}
      />
      <BarChartCard
        translateLabels
        title={t("hometown.title")}
        description={t("hometown.description")}
        color="primary"
        categories={["verified", "unverified"]}
        categoriesLabels={[
          t("labels.verified.title"),
          t("labels.unverified.title"),
        ]}
        chartData={Object.entries(charts?.hometown ?? {}).map(
          ([month, value]) => {
            return {
              month,
              unverified: value.unverified,
              verified: value.verified,
            };
          }
        )}
      />
      <BarChartCard
        translateLabels
        title={t("religion.title")}
        description={t("religion.description")}
        color="primary"
        categories={["verified", "unverified"]}
        categoriesLabels={[
          t("labels.verified.title"),
          t("labels.unverified.title"),
        ]}
        chartData={Object.entries(charts?.religion ?? {}).map(
          ([month, value]) => {
            return {
              month,
              unverified: value.unverified,
              verified: value.verified,
            };
          }
        )}
      />

      <BarChartCard
        translateLabels
        title={t("country.title")}
        description={t("country.description")}
        color="primary"
        categories={["verified", "unverified"]}
        categoriesLabels={[
          t("labels.verified.title"),
          t("labels.unverified.title"),
        ]}
        chartData={Object.entries(charts?.country ?? {}).map(
          ([month, value]) => {
            return {
              month,
              unverified: value.unverified,
              verified: value.verified,
            };
          }
        )}
      />

      <BarChartCard
        translateLabels
        title={t("ethnicity.title")}
        description={t("ethnicity.description")}
        color="primary"
        categories={["verified", "unverified"]}
        categoriesLabels={[
          t("labels.verified.title"),
          t("labels.unverified.title"),
        ]}
        chartData={Object.entries(charts?.ethnicity ?? {}).map(
          ([month, value]) => {
            return {
              month,
              unverified: value.unverified,
              verified: value.verified,
            };
          }
        )}
      />
    </div>
  );
};

export default CensusCharts;
