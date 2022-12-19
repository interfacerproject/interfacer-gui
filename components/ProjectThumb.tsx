import { getResourceImage } from "lib/resourceImages";
import type { EconomicResource } from "lib/types";
import Thumbnail from "./Thumbnail";

export interface Props {
  project: Partial<EconomicResource>;
}

export default function ProjectThumb(props: Props) {
  const { project } = props;
  const image = getResourceImage(project);

  return <Thumbnail image={image} />;
}
