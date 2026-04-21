"use client";

import { BarChartProps } from "@/lib/types/charts";
import { Card, CardProps, cn } from "@heroui/react";
import { useLocale } from "next-intl";
import { forwardRef } from "react";
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import useCountries from "../hooks/localization/country";
import useEthnicity from "../hooks/localization/ethnicity";
import useGender from "../hooks/localization/gender";
import useProvinces from "../hooks/localization/provinces";
import useReligiousAffiliation from "../hooks/localization/religious_affiliation";

const BarChartCard = forwardRef<HTMLDivElement, Omit<CardProps, "children"> & BarChartProps>(
  (
    {
      className,
      title,
      description,
      categories,
      categoriesLabels,
      color,
      chartData,
      actions,
      translateLabels,
      ...props
    },
    ref,
  ) => {
    const genderOptions = useGender();
    const provinces = useProvinces();
    const religions = useReligiousAffiliation();
    const ethnicities = useEthnicity();
    const countries = useCountries();
    const locale = useLocale();
    const isRtl = locale === "ar" || locale === "ku";

    const allTranslations = {
      ...genderOptions,
      ...provinces,
      ...religions,
      ...ethnicities,
      ...countries,
      unknown: "N/A",
    };

    const translateLabel = (value: string) => {
      if (!translateLabels) return value;
      return allTranslations[value as keyof typeof allTranslations] ?? value;
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "border-default-200 dark:border-default-100 overflow-hidden rounded-lg border p-0 shadow-none",
          className,
        )}
        {...props}
      >
        <div className="border-b-default-200 dark:border-b-default-100 bg-default-50 border-b px-4 py-3">
          <div className="flex items-center justify-between gap-x-2">
            <dt>
              <h3 className="text-default-800 text-sm font-semibold">{title}</h3>
              <p className="text-tiny text-default-500">{description}</p>
            </dt>
            {actions}
          </div>
        </div>
        <div className="px-1 pt-4 pb-2" style={{ height: `${chartData.length * 55 + 24}px`, direction: "ltr" }}>
          <ResponsiveContainer className="[&_.recharts-surface]:outline-hidden" height="100%" width="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              stackOffset="sign"
              layout="vertical"
              margin={{
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
              }}
            >
              <YAxis
                type="category"
                dataKey="month"
                strokeOpacity={0}
                style={{ fontSize: "12px" }}
                tickLine={false}
                axisLine={false}
                width={130}
                orientation={isRtl ? "right" : "left"}
                tickFormatter={(value: string) => translateLabel(value)}
                tick={{
                  fill: "hsl(var(--heroui-default-700))",
                }}
                tickMargin={8}
              />
              <XAxis
                type="number"
                axisLine={false}
                style={{
                  fontSize: "var(--heroui-font-size-tiny)",
                }}
                tickLine={false}
                allowDecimals={false}
                mirror={isRtl}
              />
              <Tooltip
                content={({ payload }) => {
                  const month = payload?.[0]?.payload?.month;

                  return (
                    <div className="rounded-medium bg-background text-tiny shadow-small flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                      <div className="flex w-full flex-col gap-y-1">
                        <span className="text-foreground font-medium">{translateLabel(month)}</span>
                        {payload?.map((p, index) => {
                          const name = p.name;
                          const value = p.value;
                          const category = categories.find((c) => c.toLowerCase() === name) ?? name;

                          return (
                            <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                              <div
                                className="h-2 w-2 flex-none rounded-full"
                                style={{
                                  backgroundColor:
                                    index === 0
                                      ? color === "default"
                                        ? "hsl(var(--heroui-foreground))"
                                        : `hsl(var(--heroui-${color}))`
                                      : "hsl(var(--heroui-default-200))",
                                }}
                              />
                              <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                <span className="text-default-500">
                                  {categoriesLabels ? categoriesLabels[index] : category}
                                </span>
                                <span className="text-default-700 font-mono font-medium">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
                cursor={false}
              />
              {[-1000, 0, 1000].map((value) => (
                <ReferenceLine key={value} stroke="hsl(var(--heroui-default-200))" strokeDasharray="3 3" y={value} />
              ))}
              {categories.map((category, index) => (
                <Bar
                  key={category}
                  animationDuration={450}
                  animationEasing="ease"
                  barSize={8}
                  dataKey={category}
                  fill={
                    index === 0
                      ? cn({
                          "hsl(var(--heroui-foreground))": color === "default",
                          "hsl(var(--heroui-success))": color === "success",
                          "hsl(var(--heroui-warning))": color === "warning",
                          "hsl(var(--heroui-danger))": color === "danger",
                          "hsl(var(--heroui-primary))": color === "primary",
                          "hsl(var(--heroui-secondary))": color === "secondary",
                        })
                      : "hsl(var(--heroui-default-200))"
                  }
                  radius={[8, 8, 8, 8]}
                  stackId="stack"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 
        <div className="flex w-full justify-center gap-4 pb-4 text-tiny text-default-500">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--heroui-${
                    index === 0
                      ? color === "default"
                        ? "foreground"
                        : color
                      : "default-200"
                  }))`,
                }}
              />
              <span className="capitalize">{t(category)}</span>
            </div>
          ))}
        </div> */}
      </Card>
    );
  },
);

BarChartCard.displayName = "BarChartCard";

export default BarChartCard;
