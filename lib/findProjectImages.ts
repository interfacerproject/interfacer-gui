import { EconomicResource } from "./types";

const findProjectImages = (project: Partial<EconomicResource>): string[] => {
  const singleImage = typeof project?.metadata?.image === "string";
  const metadataImage = singleImage ? [project?.metadata?.image] : project?.metadata?.image || [];
  const images: string[] =
    project && project.images!.length > 0
      ? project?.images?.filter(image => !!image.bin).map(image => `data:${image.mimeType};base64,${image.bin}`)
      : metadataImage;
  return images;
};

export default findProjectImages;
