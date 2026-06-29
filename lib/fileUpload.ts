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
