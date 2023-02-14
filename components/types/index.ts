import type React from "react";

//

export interface SelectOption {
  label: string;
  value: string;
  media?: React.ReactElement;
}

//

export enum ProjectType {
  DESIGN = "design",
  PRODUCT = "product",
  SERVICE = "service",
}

export const projectTypes = Object.values(ProjectType);
