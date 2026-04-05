import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { RegistrationForm } from "@/lib/types/census";

export interface SectionProps {
  control: Control<RegistrationForm>;
  getValues: UseFormGetValues<RegistrationForm>;
  setValue: UseFormSetValue<RegistrationForm>;
  t: (key: string) => string;
}
