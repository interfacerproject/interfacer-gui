import React, { ChangeEventHandler, LegacyRef } from "react";
import { ExclamationIcon } from "@heroicons/react/solid";

type BrInputProps = {
  type?: "number" | "text" | "password" | "date" | "email";
  value?: string;
  placeholder?: string;
  label?: string;
  onChange?: ChangeEventHandler;
  onBlur?: ChangeEventHandler;
  hint?: string;
  error?: string;
  className?: string;
  ref?: any;
  help?: string;
  testID?: string;
};

const BrInput = (props: BrInputProps) => {
  return (
    <>
      <div className={`form-control ${props.className}`}>
        <label className="label">
          <h4 className="label-text">{props.label}</h4>
        </label>
        <input
          type={props.type}
          placeholder={props.placeholder}
          onChange={props.onChange}
          onBlur={props.onBlur}
          className="w-full rounded-md input input-bordered focus:input-primary"
          value={props.value}
          ref={props.ref}
          data-test={props.testID}
        />
        <label className="flex-col items-start label">
          {props.error && (
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
              <ExclamationIcon className="w-5 h-5" />
              {props.error}
            </span>
          )}
          {props.hint && <span className="label-text-alt">{props.hint}</span>}
          {props.help && <p className="text-[#8A8E96]">{props.help}</p>}
        </label>
      </div>
    </>
  );
};

export default BrInput;
