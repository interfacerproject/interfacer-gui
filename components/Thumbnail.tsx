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

import { Icon } from "@bbtgnn/polaris-interfacer";
import { DynamicSourceMinor } from "@shopify/polaris-icons";

export interface Props {
  image: string;
  alt?: string;
}

export default function Thumbnail(props: Props) {
  const { image, alt = "" } = props;

  return (
    <div className="w-20 h-20 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
      {image && <img src={image} alt={alt} className="w-full h-full object-cover" />}
      {!image && <Icon color="subdued" source={DynamicSourceMinor} />}
    </div>
  );
}
