import { ButtonProps } from "@heroui/react";

export type ChartData = {
    month: string;
    [key: string]: string | number;
}

export type BarChartProps = {
  title: string;
  description: string;
  unit?: string;
  translateLabels?: boolean;
  color: ButtonProps["color"];
  categories: Array<string>;
  categoriesLabels?: Array<string>;
  chartData: Array<ChartData>;
  actions?: React.ReactNode;
};