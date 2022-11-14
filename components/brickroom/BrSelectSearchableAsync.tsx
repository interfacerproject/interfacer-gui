import { forwardRef } from "react";
import { GroupBase } from "react-select";
import AsyncSelect, { AsyncProps } from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import BrFieldInfo, { BrFieldInfoProps } from "./BrFieldInfo";

//

export interface BrSelectSearchableAsyncProps extends AsyncProps<any, boolean, GroupBase<any>>, BrFieldInfoProps {
  creatable?: boolean;
}

//

const BrSelectSearchableAsync = forwardRef<any, BrSelectSearchableAsyncProps>((props, ref) => {
  const { creatable = false } = props;

  return (
    <BrFieldInfo {...props}>
      {!creatable ? <AsyncSelect {...props} ref={ref} /> : <AsyncCreatableSelect {...props} ref={ref} />}
    </BrFieldInfo>
  );
});

//

BrSelectSearchableAsync.displayName = "BrSelectSearchableAsync";
export default BrSelectSearchableAsync;

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
