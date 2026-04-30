import type { Attachment } from "./dpp-types";

export type ProjectModelMetadata = {
  contentType?: string;
  downloadUrl: string;
  extension: string;
  fileName?: string;
  id?: string;
  mimeType?: string;
  name: string;
  size?: number;
  storage: "dpp";
  uploadedAt?: string;
  url: string;
  checksum?: string;
};

type UploadModelFile = (file: File) => Promise<Attachment>;
const DPP_BASE_URL = process.env.NEXT_PUBLIC_DPP_URL;

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function dppAttachmentToProjectModel(attachment: Attachment): ProjectModelMetadata {
  const url = DPP_BASE_URL ? `${DPP_BASE_URL}/file/${encodeURIComponent(attachment.id)}` : attachment.url;

  return {
    contentType: attachment.contentType,
    checksum: attachment.checksum,
    downloadUrl: url,
    extension: getExtension(attachment.fileName),
    fileName: attachment.fileName,
    id: attachment.id,
    mimeType: attachment.contentType,
    name: attachment.fileName,
    size: attachment.size,
    storage: "dpp",
    uploadedAt: attachment.uploadedAt,
    url,
  };
}

export async function uploadModelFilesToDpp(
  files: Array<File>,
  uploadModelFile: UploadModelFile
): Promise<Array<ProjectModelMetadata>> {
  const models: Array<ProjectModelMetadata> = [];

  for (const file of files) {
    const attachment = await uploadModelFile(file);
    models.push(dppAttachmentToProjectModel(attachment));
  }

  return models;
}
