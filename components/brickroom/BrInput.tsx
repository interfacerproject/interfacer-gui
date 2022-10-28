import React from "react";
import BrFieldInfo, { BrFieldInfoProps } from "./BrFieldInfo";
import BrInputBase, { BrInputBaseProps } from "./BrInputBase";

interface BrInputProps extends BrInputBaseProps, BrFieldInfoProps {}

const BrInput = React.forwardRef<HTMLInputElement, BrInputProps>((props, ref) => {
  return (
    <BrFieldInfo {...props} for={props.name}>
      <BrInputBase {...props} ref={ref} />
    </BrFieldInfo>
  );
});

BrInput.displayName = "BrInput";
export default BrInput;
