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

import { File } from "lib/types";
import ProjectTypeRoundIcon from "./ProjectTypeRoundIcon";
import { ProjectType } from "./types";

interface Props {
  image: File | string | undefined;
  className?: string;
  projectType?: ProjectType;
}

const ProjectImage = (props: Props) => {
  const { image, projectType } = props;

  const src = typeof image === "string" ? image : `data:${image?.mimeType};base64,${image?.bin}`;

  return (
    <div className="h-60 bg-base-200 rounded-lg flex items-center justify-center">
      {!image && projectType && (
        <div className="opacity-40">
          <ProjectTypeRoundIcon projectType={projectType} />
        </div>
      )}
      {image && src && <img src={src} className="w-full h-full object-cover" alt="" />}
    </div>
  );
};

export default ProjectImage;
