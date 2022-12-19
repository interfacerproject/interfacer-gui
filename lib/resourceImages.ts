import type { EconomicResource, File } from "./types";

export function createImageSrc(image: File) {
  return `data:${image.mimeType};base64,${image.bin}`;
}

export function getResourceImage(resource: Partial<EconomicResource>): string {
  let metadataImage = resource.metadata?.image as string;
  let galleryImage = "";
  if (resource.images && resource.images.length > 0) {
    galleryImage = createImageSrc(resource.images[0]);
  }
  return metadataImage || galleryImage;
}
