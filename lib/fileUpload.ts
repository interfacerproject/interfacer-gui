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
 * File upload utilities — delegates to @dyne/interfacer-client SDK.
 */
export { prepFilesForZenflows, prepFileForZenflows, formatImageSrc } from "@dyne/interfacer-client";
import type { InterfacerClient } from "@dyne/interfacer-client";

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

/** Module-level client reference — set by AuthContext on init so uploadFile/uploadFiles work. */
let _client: InterfacerClient | null = null;

/** Called by AuthContext to register the client. */
export function setFileUploadClient(client: InterfacerClient | null) {
  _client = client;
}

/** Upload a single file to Zenflows file storage (so images[].bin is populated). */
export async function uploadFile(file: File): Promise<void> {
  if (!_client) {
    console.warn("uploadFile: no client registered, skipping upload");
    return;
  }
  try {
    await _client.files.uploadToZenflows(file);
  } catch (e) {
    console.error("uploadFile failed:", e);
  }
}

/** Upload multiple files to Zenflows file storage. */
export async function uploadFiles(files: Array<File>): Promise<void> {
  if (!_client) {
    console.warn("uploadFiles: no client registered, skipping uploads");
    return;
  }
  await Promise.all(files.map(file => uploadFile(file)));
}

/** Upload a single file to DPP for permanent hosting. */
export async function UploadFileOnDPP(file: File): Promise<any> {
  if (!_client) throw new Error("No client registered — call setFileUploadClient first");
  return _client.files.uploadToDpp(file);
}
