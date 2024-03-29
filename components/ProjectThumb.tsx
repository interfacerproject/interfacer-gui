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

import findProjectImages from "lib/findProjectImages";
import type { EconomicResource } from "lib/types";
import Thumbnail, { Size } from "./Thumbnail";

export interface Props {
  project: Partial<EconomicResource>;
  size?: Size;
}

export default function ProjectThumb(props: Props) {
  const { project, size = "md" } = props;
  const src =
    findProjectImages(project)?.[0] ||
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPkFFxcDwACJgE+S4F7fQAAAABJRU5ErkJggg==";

  return <Thumbnail image={src} size={size} />;
}
