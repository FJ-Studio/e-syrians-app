"use client";

import { BarChartProps } from "@/lib/types/charts";
import { Card, CardProps, cn } from "@heroui/react";
import { forwardRef } from "react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useProvinces from "../hooks/localization/provinces";
import useReligiousAffiliation from "../hooks/localization/religious_affiliation";
import useEthnicity from "../hooks/localization/ethnicity";
import useCountries from "../hooks/localization/country";
import useGender from "../hooks/localization/gender";
// import useEducationLevels from "../hooks/localization/education";
// import useSpokenLanguages from "../hooks/localization/languages";
// import useSourceOfIncome from "../hooks/localization/income";
// import useHealthStatuses from "../hooks/localization/health";

const BarChartCard = forwardRef<
  HTMLDivElement,
  Omit<CardProps, "children"> & BarChartProps
>(
  (
    {
      className,
      title,
      description,
      categories,
      color,
      chartData,
      actions,
      translateLabels,
      ...props
    },
    ref
  ) => {
    const genderOptions = useGender();
    const provinces = useProvinces();
    const religions = useReligiousAffiliation();
    const ethnicities = useEthnicity();
    const countries = useCountries();
    // const educationLevels = useEducationLevels();
    // const spokenLanguages = useSpokenLanguages();
    // const incomeSources = useSourceOfIncome();
    // const HealthStatuses = useHealthStatuses();

    const allTranslations = {
      ...genderOptions,
      ...provinces,
      ...religions,
      ...ethnicities,
      ...countries,
      // ...educationLevels,
      // ...spokenLanguages,
      // ...incomeSources,
      // ...HealthStatuses,
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "h-[300px] border border-transparent dark:border-default-100 shadow-none rounded-none",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-y-2 mb-4">
          <div className="flex items-center justify-between gap-x-2">
            <dt>
              <h3 className="font-medium text-default-700">{title}</h3>
              <p className="text-small text-default-500">{description}</p>
            </dt>
            {actions}
          </div>
        </div>
        <ResponsiveContainer
          className="[&_.recharts-surface]:outline-none"
          height="100%"
          width="100%"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            stackOffset="sign"
            margin={{
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
            }}
          >
            <XAxis
              dataKey="month"
              strokeOpacity={0.25}
              style={{ fontSize: "var(--heroui-font-size-tiny)", color: "red" }}
              tickLine={false}
              tickFormatter={(value) => {
                return translateLabels
                  ? allTranslations[value as keyof typeof allTranslations]
                  : value;
              }}
            />
            <YAxis
              axisLine={false}
              style={{ fontSize: "var(--heroui-font-size-tiny)" }}
              tickLine={false}
            />
            <Tooltip
              content={({ payload }) => {
                const month = payload?.[0]?.payload?.month;

                return (
                  <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-background p-2 text-tiny shadow-small">
                    <div className="flex w-full flex-col gap-y-1">
                      <span className="font-medium text-foreground">
                        {translateLabels
                          ? allTranslations[
                              month as keyof typeof allTranslations
                            ]
                          : month}
                      </span>
                      {payload?.map((p, index) => {
                        const name = p.name;
                        const value = p.value;
                        const category =
                          categories.find((c) => c.toLowerCase() === name) ??
                          name;

                        return (
                          <div
                            key={`${index}-${name}`}
                            className="flex w-full items-center gap-x-2"
                          >
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
                            <div className="flex w-full items-center justify-between gap-x-2 pr-1 text-xs text-default-700">
                              <span className="text-default-500">
                                {category}
                              </span>
                              <span className="font-mono font-medium text-default-700">
                                {value}
                              </span>
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
              <ReferenceLine
                key={value}
                stroke="hsl(var(--heroui-default-200))"
                strokeDasharray="3 3"
                y={value}
              />
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
                radius={[8, 8, 0, 0]}
                stackId="stack"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
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
  }
);

BarChartCard.displayName = "BarChartCard";

export default BarChartCard;
