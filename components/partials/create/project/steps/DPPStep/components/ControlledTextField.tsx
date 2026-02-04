import { TextField } from "@bbtgnn/polaris-interfacer";
import { Controller, useFormContext } from "react-hook-form";

interface ControlledTextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  multiline?: number;
  helpText?: string;
  disabled?: boolean;
}

export const ControlledTextField = ({
  name,
  label,
  placeholder = "",
  multiline,
  helpText,
  disabled = false,
}: ControlledTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextField
          type="text"
          label={label}
          placeholder={placeholder}
          autoComplete="off"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          multiline={multiline}
          helpText={helpText}
          disabled={disabled}
        />
      )}
    />
  );
};
