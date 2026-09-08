import { EconomicResource } from "./types";

type RawModelEntry =
  | string
  | {
      url?: string;
      href?: string;
      src?: string;
      downloadUrl?: string;
      id?: string;
      hash?: string;
      name?: string;
      fileName?: string;
      mimeType?: string;
      contentType?: string;
      extension?: string;
      size?: number;
      storage?: string;
    };

export type ProjectModelDescriptor = {
  downloadUrl: string;
  extension: string;
  format: "step" | "stl" | "unknown";
  hash?: string;
  id?: string;
  isViewable: boolean;
  mimeType?: string;
  name: string;
  size?: number;
  url: string;
};

const supportedExtensions = new Set(["step", "stp", "stl"]);
const DPP_BASE_URL = process.env.NEXT_PUBLIC_DPP_URL;

function isResolvableUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  if (value.startsWith("/")) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getExtensionFromMimeType(mimeType?: string): string {
  if (!mimeType) {
    return "";
  }

  const normalizedMimeType = mimeType.toLowerCase();
  if (normalizedMimeType.includes("stl") || normalizedMimeType.includes("sla")) {
    return "stl";
  }
  if (normalizedMimeType.includes("step") || normalizedMimeType.includes("stp")) {
    return "step";
  }
  return "";
}

function getExtensionFromValue(value?: string): string {
  if (!value) {
    return "";
  }

  const match = value.toLowerCase().match(/\.([a-z0-9]+)(?:$|\?)/);
  return match?.[1] || "";
}

function normalizeExtension(extension?: string, name?: string, url?: string, mimeType?: string): string {
  const normalizedExtension = (extension || "").toLowerCase().replace(/^\./, "");
  return (
    normalizedExtension ||
    getExtensionFromValue(name) ||
    getExtensionFromValue(url) ||
    getExtensionFromMimeType(mimeType)
  );
}

function formatFromExtension(extension: string): ProjectModelDescriptor["format"] {
  if (extension === "stl") {
    return "stl";
  }
  if (extension === "step" || extension === "stp") {
    return "step";
  }
  return "unknown";
}

function inferName(url: string, fallbackExtension: string): string {
  const fileName = url.split("/").pop()?.split("?")[0];
  if (fileName) {
    return decodeURIComponent(fileName);
  }
  if (fallbackExtension) {
    return `3d-model.${fallbackExtension}`;
  }
  return "3d-model";
}

function buildFileUrl(hash: string, mimeType?: string): string {
  const mimeTypeQuery = mimeType ? `?type=${encodeURIComponent(mimeType)}` : "";
  return `/api/file/${encodeURIComponent(hash)}${mimeTypeQuery}`;
}

function buildDppDownloadUrl(id: string, fallbackUrl: string): string {
  if (!DPP_BASE_URL) {
    return fallbackUrl;
  }

  return `${DPP_BASE_URL}/file/${encodeURIComponent(id)}`;
}

function buildDppPreviewUrl(id: string, fileName: string, mimeType?: string): string {
  const mimeTypeQuery = mimeType ? `?type=${encodeURIComponent(mimeType)}` : "";
  return `/api/dpp-file/${encodeURIComponent(id)}/${encodeURIComponent(fileName)}${mimeTypeQuery}`;
}

function normalizeEntry(entry: RawModelEntry): ProjectModelDescriptor | null {
  if (typeof entry === "string") {
    if (!isResolvableUrl(entry)) {
      return null;
    }

    const extension = normalizeExtension(undefined, undefined, entry, undefined);
    return {
      downloadUrl: entry,
      extension,
      format: formatFromExtension(extension),
      isViewable: supportedExtensions.has(extension),
      name: inferName(entry, extension),
      url: entry,
    };
  }

  const mimeType = entry.mimeType || entry.contentType;
  const explicitUrl = entry.url || entry.href || entry.src || entry.downloadUrl;
  const url =
    explicitUrl && isResolvableUrl(explicitUrl) ? explicitUrl : entry.hash ? buildFileUrl(entry.hash, mimeType) : "";

  if (!url) {
    return null;
  }

  const fileName = entry.name || entry.fileName;
  const extension = normalizeExtension(entry.extension, fileName, explicitUrl || url, mimeType);
  const name = fileName || inferName(explicitUrl || url, extension);
  const isDppFile = entry.storage === "dpp" && Boolean(entry.id);
  const resolvedUrl = isDppFile ? buildDppPreviewUrl(entry.id!, name, mimeType) : url;
  const resolvedDownloadUrl = isDppFile
    ? buildDppDownloadUrl(entry.id!, entry.downloadUrl || explicitUrl || url)
    : entry.downloadUrl && isResolvableUrl(entry.downloadUrl)
    ? entry.downloadUrl
    : url;

  return {
    downloadUrl: resolvedDownloadUrl,
    extension,
    format: formatFromExtension(extension),
    hash: entry.hash,
    id: entry.id,
    isViewable: supportedExtensions.has(extension),
    mimeType,
    name,
    size: entry.size,
    url: resolvedUrl,
  };
}

export function getRawMetadataModelEntries(metadata: Record<string, unknown>): RawModelEntry[] {
  const entries: RawModelEntry[] = [];

  if (typeof metadata.model === "string") {
    entries.push(metadata.model);
  } else if (metadata.model && typeof metadata.model === "object") {
    entries.push(metadata.model as RawModelEntry);
  }

  if (typeof metadata.modelUrl === "string") {
    entries.push(metadata.modelUrl);
  }

  if (Array.isArray(metadata.models)) {
    entries.push(...(metadata.models as RawModelEntry[]));
  }

  return entries;
}

const findProjectModels = (project: Partial<EconomicResource>): ProjectModelDescriptor[] => {
  const metadata = ((project.metadata || {}) as Record<string, unknown>) || {};
  const resolvedEntries = getRawMetadataModelEntries(metadata)
    .map(normalizeEntry)
    .filter((entry): entry is ProjectModelDescriptor => Boolean(entry));

  const seen = new Set<string>();
  return resolvedEntries.filter(entry => {
    if (seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
};

export default findProjectModels;
