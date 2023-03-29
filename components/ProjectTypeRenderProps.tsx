import { CarbonIconType, Collaborate, DataDefinition, GroupObjectsNew } from "@carbon/icons-react";
import { ProjectType } from "./types";

export type RenderProps = {
  label: string;
  icon: CarbonIconType;
  classes: {
    bg: string;
    content: string;
    border: string;
  };
};

export const ProjectTypeRenderProps: Record<ProjectType, RenderProps> = {
  [ProjectType.DESIGN]: {
    label: ProjectType.DESIGN,
    icon: GroupObjectsNew,
    classes: {
      bg: "bg-[#E4CCE3]",
      content: "text-[#413840] fill-[#413840]",
      border: "border-[#C18ABF] ring-[#C18ABF]",
    },
  },
  [ProjectType.PRODUCT]: {
    label: ProjectType.PRODUCT,
    icon: DataDefinition,
    classes: {
      bg: "bg-[#FAE5B7]",
      content: "text-[#614C1F] fill-[#614C1F]",
      border: "border-[#614C1F] ring-[#614C1F]",
    },
  },
  [ProjectType.SERVICE]: {
    label: ProjectType.SERVICE,
    icon: Collaborate,
    classes: {
      bg: "bg-[#CDE0E4]",
      content: "text-[#024960] fill-[#024960]",
      border: "border-[#5D8CA0] ring-[#5D8CA0]",
    },
  },
};
