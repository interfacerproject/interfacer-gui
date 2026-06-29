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

/**
 * File upload utilities — delegates to @interfacer/client SDK.
 */
export { prepFilesForZenflows, prepFileForZenflows, formatImageSrc } from "@interfacer/client";

export interface IFile {
  name: string;
  description: string;
  extension: string;
  hash: string;
  mimeType: string;
  size: number;
}

export function formatZenObjects(o: Record<string, unknown>): string {
  return JSON.stringify(o, null, 4);
}
export async function uploadFile(_file: File) {}
export async function uploadFiles(_files: Array<File>) {}
export async function UploadFileOnDPP(_file: File): Promise<any> {
  throw new Error("Use useAuth().client.files.uploadToDpp instead");
}
