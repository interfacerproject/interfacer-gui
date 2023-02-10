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
