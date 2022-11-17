import { SelectOptions } from "components/brickroom/utils/BrSelectUtils";
import PFieldInfo, { PFieldInfoProps } from "components/polaris/PFieldInfo";
import { forwardRef } from "react";
import Select, { Props } from "react-select";
import CreatableSelect from "react-select/creatable";

//

export interface BrSelectSearchableProps extends Props, PFieldInfoProps {
  creatable?: boolean;
  defaultValueRaw?: Array<any>;
  id?: string;
}

//

const BrSelectSearchable = forwardRef<any, BrSelectSearchableProps>((props, ref) => {
  const { creatable = false, defaultValueRaw, id } = props;
  const selectID = `${id}-select`;

  /**
   * Important explanation:
   *
   * - Values are passed to react-select as "{label, value}"
   * - If I (bbtgnn) understood correctly,
   *   To pass default values, one should have to pass explicitly {label, value}
   * - But this is too complex
   *
   * So this is my solution:
   * - props.defaultValueRaw is an Array of just {value}
   * - the next part filters the options array by the values
   * - Thus creating the defaultValue array of {label, value}
   */
  let defaultValue: SelectOptions<any> = [];
  if (defaultValueRaw && props.options) {
    defaultValue = (props.options as SelectOptions<any>).filter(o => defaultValueRaw.includes(o.value));
  }

  return (
    <PFieldInfo {...props}>
      {!creatable && <Select defaultValue={defaultValue} {...props} ref={ref} id={selectID} />}
      {creatable && <CreatableSelect defaultValue={defaultValue} {...props} ref={ref} id={selectID} />}
    </PFieldInfo>
  );
});

//

BrSelectSearchable.displayName = "BrSelectSearchable";
export default BrSelectSearchable;

//

//   const customStyles = {
//     control: (provided: any, state: any) => ({
//       ...provided,
//       "&:hover": { borderColor: "green" },
//       height: 49,
//       border: state.isFocused ? "2px solid" : provided.border,
//     }),
//     valueContainer: (provided: any, state: any) => ({
//       ...provided,
//       display: state.isMulti && state.hasValue ? "flex" : provided.display,
//       "flex-flow": "nowrap",
//     }),
//     placeholder: (provided: any) => ({
//       ...provided,
//       width: "100%",
//       "white-space": "nowrap",
//       overflow: "hidden",
//       "text-overflow": "ellipsis",
//     }),
//   };

//   const customTheme = (theme: any) => ({
//     ...theme,
//     borderRadius: 6,
//     colors: {
//       ...theme.colors,
//       primary25: "#F1BD4D",
//       primary: "#02604B",
//     },
//   });

//   const onKeyDown = (e: any) => {
//     if (e.keyCode === 8 && !inputValue && onBackspace) {
//       e.preventDefault();
//       e.stopPropagation();
//       onBackspace();
//     }
//     if (e.keyCode === 188 && isCreatable && inputValue && Array.isArray(value)) {
//       e.preventDefault();
//       e.stopPropagation();
//       onChange([...value, { value: inputValue, label: inputValue }]);
//       onInputChange("");
//     }
//     if (e.keyCode === 32 && isCreatable && inputValue && Array.isArray(value)) {
//       e.preventDefault();
//       e.stopPropagation();
//       onChange([...value, { value: inputValue, label: inputValue }]);
//       onInputChange("");
//     }
//   };

//   const selectProps = {
//     closeMenuOnSelect: !multiple,
//     value: value,
//     options: options,
//     onChange: onChange,
//     onInputChange: onInputChange,
//     placeholder: placeholder,
//     inputValue: inputValue,
//     isMulti: multiple,
//     className: "border border-gray-300 rounded-md",
//     styles: customStyles,
//     theme: customTheme,
//     onKeyDown: onKeyDown,
//   };
