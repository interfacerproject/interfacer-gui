import React, { ChangeEventHandler } from "react";
import BrFieldInfo, { BrFieldInfoProps } from "./BrFieldInfo";

//

interface BrInputProps extends BrFieldInfoProps {
  type?: "number" | "text" | "password" | "date" | "email";
  name: string;
  value?: string | number;
  placeholder?: string;
  onChange?: ChangeEventHandler;
  onBlur?: ChangeEventHandler;
  testID?: string;
}

//

const BrInput = React.forwardRef<HTMLInputElement, BrInputProps>((props, ref) => {
  const { type = "text" } = props;

  return (
    <BrFieldInfo {...props} for={props.name}>
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
    </BrFieldInfo>
  );
});

//

BrInput.displayName = "BrInput";
export default BrInput;
