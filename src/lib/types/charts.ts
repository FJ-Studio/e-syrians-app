import { ButtonProps } from "@heroui/react";

export type ChartData = {
    month: string;
    [key: string]: string | number;
}

export type BarChartProps = {
  title: string;
  value: string;
  unit?: string;
  color: ButtonProps["color"];
  categories: Array<string>;
  chartData: Array<ChartData>;
};