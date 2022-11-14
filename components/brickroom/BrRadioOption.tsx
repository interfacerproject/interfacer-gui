import classNames from "classnames";
import { forwardRef } from "react";
import { TestProp } from "./types";

//

export interface BrRadioOptionProps extends TestProp {
  id: string;
  label: string;
  name: string;
  value: string;
  description?: string;
}

//

const BrRadioOption = forwardRef<HTMLInputElement, BrRadioOptionProps>((props, ref) => {
  const { name, label, description, id, value, testID, ...other } = props;
  // `...other` is needed to pass extra props to the input element
  // for example, 'react-hook-form' has to pass {...register("name")}

  const classes = classNames({
    // Base styles
    "flex flex-row items-center space-x-3 p-4 border-1 rounded-md": true,
    // Not checked
    "hover:bg-gray-200 hover:cursor-pointer border-gray-300": true,
    // Checked /* TODO */
    // "border-green-600 bg-green-100": checked,
  });

  return (
    <label htmlFor={id} className={classes} data-test={testID}>
      <input type="radio" name={name} id={id} ref={ref} value={value} {...other} />
      <div>
        <p className="font-bold">{label}</p>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </label>
  );
});

//

BrRadioOption.displayName = "BrRadioOption";
export default BrRadioOption;
