import CensusLayout from "@/components/census/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-SYRIANS Network - National Census",
  description:
    "For every Syrian, creating a better homeland and a brighter future.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CensusLayout>{children}</CensusLayout>;
}
