import { getResourceImage } from "lib/resourceImages";
import type { EconomicResource } from "lib/types";
import Thumbnail, { Size } from "./Thumbnail";

export interface Props {
  project: Partial<EconomicResource>;
  size?: Size;
}

export default function ProjectThumb(props: Props) {
  const { project, size = "md" } = props;
  const image = getResourceImage(project);

  return <Thumbnail image={image} size={size} />;
}
