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
import { ProjectType } from "./types";

import DesignIcon from "public/project-icons/design.svg";
import ProductIcon from "public/project-icons/product.svg";
import ServiceIcon from "public/project-icons/service.svg";

interface Props {
  image: File | string | undefined;
  className?: string;
  projectType?: ProjectType;
}

const ProjectImage = (props: Props) => {
  const { image, className, projectType } = props;

  const icons: Record<ProjectType, string> = {
    [ProjectType.DESIGN]: DesignIcon.src,
    [ProjectType.PRODUCT]: ProductIcon.src,
    [ProjectType.SERVICE]: ServiceIcon.src,
  };

  const src = typeof image === "string" ? image : `data:${image?.mimeType};base64,${image?.bin}`;

  return (
    <div className="w-full h-60 bg-base-300 rounded-lg">
      {!image && projectType && (
        <div className="w-full h-full flex items-center justify-center opacity-50">
          <img className="h-20 w-20" src={icons[projectType]} alt={`${projectType} icon`} />
        </div>
      )}
      {image && src && <img src={src} className={className} alt="" />}
    </div>
  );
};

export default ProjectImage;
