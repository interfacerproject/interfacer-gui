import { forwardRef } from "react";

// Components
import BrFieldInfo, { BrFieldInfoProps } from "./BrFieldInfo";
import BrRadioOption, { BrRadioOptionProps } from "./BrRadioOption";

//

export interface BrRadioProps extends BrFieldInfoProps {
  name: string;
  options: Array<Omit<BrRadioOptionProps, "name">>;
}

//

const BrRadio = forwardRef<HTMLInputElement, BrRadioProps>((props, ref) => {
  const { options, ...other } = props;
  // `...other` is needed to pass extra props to the input element
  // for example, 'react-hook-form' has to pass {...register("name")}

  return (
    <BrFieldInfo {...props}>
      {options.map(option => (
        <BrRadioOption {...option} {...other} key={option.id} />
      ))}
    </BrFieldInfo>
  );
});

//

BrRadio.displayName = "BrRadio";
export default BrRadio;

// export default function BrRadio(props: BrRadioProps) {
//   const { options, onChange = () => {} } = props;

//   return (
//     <BrFieldInfo {...props}>
//       {options.map(o) => (
//         <label
//           key={unit?.id}
//           className={`label cursor-pointer flex ${
//             props.value === unit.value ? "bg-green-100 border border-green-400 rounded" : ""
//           }`}
//         >
//           <input
//             type="radio"
//             className="radio checked:bg-primary"
//             name={unit.name}
//             value={unit.value}
//             onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
//             checked={props.value === unit.value}
//             data-test={props.testID}
//           />
//           <div className="flex-auto ml-5">
//             <h4 className={`label-text ${props.value === unit.value ? "text-primary mb-0" : "mb-0"}`}>{unit.name}</h4>
//             <span className={`label-text ${props.value === unit.value ? "text-primary" : ""}`}>{unit.label}</span>
//           </div>
//         </label>
//       ))}
//     </BrFieldInfo>
//   );
// }
