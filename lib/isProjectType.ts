import { ProjectType } from "components/types";

export function isProjectType(name: string | ProjectType): Record<ProjectType, boolean> {
  return {
    [ProjectType.DESIGN]: name === ProjectType.DESIGN,
    [ProjectType.PRODUCT]: name === ProjectType.PRODUCT,
    [ProjectType.SERVICE]: name === ProjectType.SERVICE,
  };
}
