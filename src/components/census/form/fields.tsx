"use client";

import {
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { Key, ReactElement, ReactNode } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

// ---------------------------------------------------------------------------
// Shared props
// ---------------------------------------------------------------------------

interface BaseFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  rules?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseFormSetValueAny = (name: any, value: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseFormGetValuesAny = (name: any) => any;

// ---------------------------------------------------------------------------
// FormInput
// ---------------------------------------------------------------------------

interface FormInputProps<T extends FieldValues> extends BaseFieldProps<T> {
  placeholder?: string;
  description?: string;
  type?: string;
  isRequired?: boolean;
  startContent?: ReactNode;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  description,
  type,
  isRequired,
  startContent,
  rules,
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error, invalid } }) => (
        <Input
          {...field}
          isRequired={isRequired}
          type={type}
          label={label}
          placeholder={placeholder}
          description={description}
          errorMessage={error?.message}
          isInvalid={invalid}
          startContent={startContent}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// FormSelect
// ---------------------------------------------------------------------------

interface FormSelectProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Record<string, string>;
  isRequired?: boolean;
  description?: string;
  selectionMode?: "single" | "multiple";
  defaultSelectedKeys?: string[];
  scrollShadowProps?: Record<string, unknown>;
  renderItem?: (key: string, label: string) => ReactElement;
  onSelectionChange?: (selected: { anchorKey?: string }) => void;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  isRequired,
  description,
  selectionMode,
  defaultSelectedKeys,
  scrollShadowProps,
  renderItem,
  onSelectionChange,
  rules,
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error, invalid } }) => (
        <Select
          scrollShadowProps={scrollShadowProps}
          {...field}
          label={label}
          isRequired={isRequired}
          disallowEmptySelection={isRequired}
          isInvalid={invalid}
          errorMessage={error?.message}
          description={description}
          selectionMode={selectionMode}
          defaultSelectedKeys={defaultSelectedKeys}
          onSelectionChange={onSelectionChange}
        >
          {Object.keys(options).map((key) =>
            renderItem ? (
              renderItem(key, options[key])
            ) : (
              <SelectItem key={key} textValue={options[key]}>
                {options[key]}
              </SelectItem>
            ),
          )}
        </Select>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// FormAutocomplete
// ---------------------------------------------------------------------------

interface FormAutocompleteProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Record<string, string>;
  isRequired?: boolean;
  description?: string;
  defaultValue?: string;
  scrollShadowProps?: Record<string, unknown>;
  renderItem?: (key: string, label: string) => ReactElement;
  onChange?: (key: string | null) => void;
}

export function FormAutocomplete<T extends FieldValues>({
  name,
  control,
  label,
  options,
  isRequired,
  description,
  defaultValue,
  scrollShadowProps,
  renderItem,
  onChange: onChangeProp,
  rules,
}: FormAutocompleteProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error, invalid } }) => (
        <Autocomplete
          scrollShadowProps={scrollShadowProps}
          label={label}
          isRequired={isRequired}
          isInvalid={invalid}
          errorMessage={error?.message}
          description={description}
          defaultValue={defaultValue}
          value={field.value ?? null}
          onBlur={field.onBlur}
          onChange={(key: Key | null) => {
            const val = key?.toString() ?? null;
            field.onChange(val);
            onChangeProp?.(val);
          }}
          classNames={{ clearButton: "hidden" }}
        >
          {Object.keys(options).map((key) =>
            renderItem ? (
              renderItem(key, options[key])
            ) : (
              <AutocompleteItem key={key} textValue={options[key]}>
                {options[key]}
              </AutocompleteItem>
            ),
          )}
        </Autocomplete>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// FormCheckbox
// ---------------------------------------------------------------------------

type FormCheckboxProps<T extends FieldValues> = BaseFieldProps<T>;

export function FormCheckbox<T extends FieldValues>({ name, control, label }: FormCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          name={field.name}
          onBlur={field.onBlur}
          isSelected={field.value === true}
          onValueChange={field.onChange}
        >
          {label}
        </Checkbox>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// FormDatePicker
// ---------------------------------------------------------------------------

interface FormDatePickerProps<T extends FieldValues> extends BaseFieldProps<T> {
  getValues: UseFormGetValuesAny;
  setValue: UseFormSetValueAny;
  isRequired?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  getValues,
  setValue,
  isRequired,
  rules,
}: FormDatePickerProps<T>) {
  const currentValue = getValues(name);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ fieldState: { error, invalid } }) => (
        <DatePicker
          showMonthAndYearPickers
          inert={true}
          value={currentValue ? parseDate(currentValue) : null}
          defaultValue={currentValue ? parseDate(currentValue) : null}
          onChange={(date) => (date ? setValue(name, date.toString()) : null)}
          isRequired={isRequired}
          label={label}
          errorMessage={error?.message}
          isInvalid={invalid}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// FormTextarea
// ---------------------------------------------------------------------------

interface FormTextareaProps<T extends FieldValues> extends BaseFieldProps<T> {
  placeholder?: string;
}

export function FormTextarea<T extends FieldValues>({ name, control, label, placeholder }: FormTextareaProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <Textarea {...field} label={label} placeholder={placeholder} />}
    />
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

export function SectionHeader({ number, title, description }: { number: number; title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">
        {number}. {title}
      </h3>
      {description && <p>{description}</p>}
    </div>
  );
}
