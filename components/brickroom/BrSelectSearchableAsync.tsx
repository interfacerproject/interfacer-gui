// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import PFieldInfo, { PFieldInfoProps } from "components/polaris/PFieldInfo";
import { forwardRef } from "react";
import { GroupBase } from "react-select";
import AsyncSelect, { AsyncProps } from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";

//

export interface BrSelectSearchableAsyncProps extends AsyncProps<any, boolean, GroupBase<any>>, PFieldInfoProps {
  creatable?: boolean;
}

//

const BrSelectSearchableAsync = forwardRef<any, BrSelectSearchableAsyncProps>((props, ref) => {
  const { creatable = false } = props;

  return (
    <PFieldInfo {...props}>
      {!creatable ? (
        <AsyncSelect
          {...props}
          ref={ref}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
        />
      ) : (
        <AsyncCreatableSelect
          {...props}
          ref={ref}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
        />
      )}
    </PFieldInfo>
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
