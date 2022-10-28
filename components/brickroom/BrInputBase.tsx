import React, { ChangeEventHandler } from "react";

export interface BrInputBaseProps {
  type?: "number" | "text" | "password" | "date" | "email";
  name: string;
  value?: string | number;
  placeholder?: string;
  onChange?: ChangeEventHandler;
  onBlur?: ChangeEventHandler;
  testID?: string;
}

const BrInputBase = React.forwardRef<HTMLInputElement, BrInputBaseProps>((props, ref) => {
  const { type = "text" } = props;

  return (
    <input
      className="w-full rounded-md input input-bordered focus:input-primary"
      type={type}
      name={props.name}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      onBlur={props.onBlur}
      ref={ref}
      data-test={props.testID}
    />
  );
});

BrInputBase.displayName = "BrInputBase";
export default BrInputBase;
