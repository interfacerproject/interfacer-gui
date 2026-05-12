import { EconomicResource } from "./types";

const findProjectImages = (project: Partial<EconomicResource>): string[] => {
  const singleImage = typeof project?.metadata?.image === "string";

  const metadataImages: string[] = singleImage ? [project?.metadata?.image] : project?.metadata?.image || [];

  const filteredMetadataImages = metadataImages.filter(url => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  });

  const projectImages = project?.images?.length
    ? project.images
        .filter(image => Boolean(image.bin) || Boolean(image.hash))
        .map(image =>
          image.bin
            ? `data:${image.mimeType};base64,${image.bin}`
            : `/api/image/${image.hash}?type=${encodeURIComponent(image.mimeType || "image/png")}`
        )
    : [];

  return projectImages.length > 0 ? projectImages : filteredMetadataImages;
};

export default findProjectImages;
