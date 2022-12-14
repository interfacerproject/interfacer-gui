import CreatableSelect from "react-select/creatable";
import Select from "react-select/";
import { ExclamationIcon } from "@heroicons/react/solid";
import React from "react";

type AsyncSelectProps = {
  options: any[];
  onChange: (value: any) => void;
  onInputChange: (value: any) => void;
  value?: { value: string; label: string } | string | { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
  inputValue?: string;
  help?: string;
  multiple?: boolean;
  isCreatable?: boolean;
  testID?: string;
  onBackspace?: () => void;
};

const BrSearchableSelect = ({
  onChange,
  options,
  onInputChange,
  multiple = false,
  inputValue,
  value,
  label,
  placeholder,
  hint,
  error,
  className,
  help,
  isCreatable = false,
  testID,
  onBackspace,
}: AsyncSelectProps) => {
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      "&:hover": { borderColor: "green" },
      height: 49,
      border: state.isFocused ? "2px solid" : provided.border,
    }),
    valueContainer: (provided: any, state: any) => ({
      ...provided,
      display: state.isMulti && state.hasValue ? "flex" : provided.display,
      "flex-flow": "nowrap",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      width: "100%",
      "white-space": "nowrap",
      overflow: "hidden",
      "text-overflow": "ellipsis",
    }),
  };
  const customTheme = (theme: any) => ({
    ...theme,
    borderRadius: 6,
    colors: {
      ...theme.colors,
      primary25: "#F1BD4D",
      primary: "#02604B",
    },
  });
  const onKeyDown = (e: any) => {
    if (e.keyCode === 8 && !inputValue && onBackspace) {
      e.preventDefault();
      e.stopPropagation();
      onBackspace();
    }
    if (e.keyCode === 188 && isCreatable && inputValue && Array.isArray(value)) {
      e.preventDefault();
      e.stopPropagation();
      onChange([...value, { value: inputValue, label: inputValue }]);
      onInputChange("");
    }
    if (e.keyCode === 32 && isCreatable && inputValue && Array.isArray(value)) {
      e.preventDefault();
      e.stopPropagation();
      onChange([...value, { value: inputValue, label: inputValue }]);
      onInputChange("");
    }
  };

  const selectProps = {
    closeMenuOnSelect: !multiple,
    value: value,
    options: options,
    onChange: onChange,
    onInputChange: onInputChange,
    placeholder: placeholder,
    inputValue: inputValue,
    isMulti: multiple,
    className: "border border-gray-300 rounded-md",
    styles: customStyles,
    theme: customTheme,
    onKeyDown: onKeyDown,
  };

  return (
    <div className={`form-control ${className}`} data-test={testID}>
      <label className="label">
        <h4 className="label-text">{label}</h4>
      </label>
      {isCreatable ? <CreatableSelect {...selectProps} /> : <Select {...selectProps} />}
      <label className="flex-col items-start label">
        {error && (
          <span className="flex flex-row items-center justify-between label-text-alt text-warning">
            <ExclamationIcon className="w-5 h-5" />
            {error}
          </span>
        )}
        {hint && <span className="label-text-alt">{hint}</span>}
        {help && <p className="text-[#8A8E96]">{help}</p>}
      </label>
    </div>
  );
};

export default BrSearchableSelect;
