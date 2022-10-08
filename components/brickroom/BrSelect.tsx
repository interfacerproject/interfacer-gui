import React, { ChangeEventHandler } from "react";
import { ExclamationIcon } from "@heroicons/react/solid";

type BrSelectProps = {
  array: Array<{ id: string; name: string }>;
  placeholder?: string;
  label?: string;
  value?: string | Array<string>;
  handleSelect: ChangeEventHandler;
  hint?: string;
  error?: string;
  className?: string;
  roundedLG?: boolean;
  multiple?: boolean;
};

const BrSelect = (props: BrSelectProps) => {
  const selectClass = props.roundedLG ? "select select-bordered rounded-full" : "select select-bordered";

  return (
    <>
      <div className={`form-control ${props.className}`}>
        <label className="label">
          <h4 className="label-text capitalize">{props.label}</h4>
        </label>
        <select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => props.handleSelect(e)}
          className={selectClass}
          value={props.value}
          multiple={props.multiple}
        >
          {props.placeholder && (
            <option disabled selected className="disabled" value="">
              {props.placeholder}
            </option>
          )}
          {props.array?.map((unit: { id: string; name: string }) => (
            <option key={unit?.id} value={unit?.id}>
              {unit?.name}
            </option>
          ))}
        </select>
        <label className="label">
          {props.error && (
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
              <ExclamationIcon className="w-5 h-5" />
              {props.error}
            </span>
          )}
          {props.hint && <span className="label-text-alt">{props.hint}</span>}
        </label>
      </div>
    </>
  );
};

export default BrSelect;
