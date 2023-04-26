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

import type { EconomicResource, File, IFile } from "./types";
import { PersonWithFileEssential } from "./types/extensions";

export function formatImageSrc(mimeType: string, bin: string): string {
  return `data:${mimeType};base64,${bin}`;
}

export function createImageSrc(image: File) {
  return formatImageSrc(image.mimeType, image.bin);
}

export function getResourceImage(resource: Partial<EconomicResource>): string {
  let metadataImage = resource?.metadata?.image as string;
  let galleryImage = "";
  if (resource?.images && resource.images.length > 0) {
    galleryImage = createImageSrc(resource.images[0]);
  }
  return metadataImage || galleryImage;
}

export function fileToIfile(file: File): IFile {
  return {
    name: file.name,
    mimeType: file.mimeType,
    description: file.description,
    extension: file.extension,
    hash: file.hash,
    size: file.size,
  };
}

export function getUserImage(user: Partial<PersonWithFileEssential>): string {
  const image = user.images?.[0];
  if (image) return formatImageSrc(image.mimeType, image.bin);
  else return "";
}
