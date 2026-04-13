import { RegistrationForm } from "@/lib/types/census";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";

export interface SectionProps {
  control: Control<RegistrationForm>;
  getValues: UseFormGetValues<RegistrationForm>;
  setValue: UseFormSetValue<RegistrationForm>;
  t: (key: string) => string;
}
