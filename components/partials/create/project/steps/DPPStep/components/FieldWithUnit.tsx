import { TextField } from "@bbtgnn/polaris-interfacer";
import PLabel from "components/polaris/PLabel";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface FieldWithUnitProps {
  label: string;
  valueName: string;
  unitName: string;
  placeholder?: string;
  defaultUnit: string;
}

export const FieldWithUnit = ({
  label,
  valueName,
  unitName,
  placeholder = "e.g., 1",
  defaultUnit,
}: FieldWithUnitProps) => {
  const { control, setValue, watch } = useFormContext();

  // Watch the value field to know when it's set
  const valueFieldValue = watch(valueName);
  const unitFieldValue = watch(unitName);

  // Set the default unit when the value field is set and unit is not already set
  useEffect(() => {
    if (valueFieldValue && !unitFieldValue) {
      setValue(unitName, defaultUnit);
    }
  }, [valueFieldValue, unitFieldValue, unitName, defaultUnit, setValue]);

  return (
    <div>
      <PLabel label={label} />
      <div className="flex gap-2 mt-2">
        <div className="flex-1">
          <Controller
            control={control}
            name={valueName}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                type="text"
                label=""
                placeholder={placeholder}
                autoComplete="off"
                value={value || ""}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </div>
        <div className="w-24">
          <Controller
            control={control}
            name={unitName}
            render={({ field: { onChange, value } }) => (
              <TextField
                type="text"
                label=""
                value={value || defaultUnit}
                onChange={onChange}
                autoComplete="off"
                disabled
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
