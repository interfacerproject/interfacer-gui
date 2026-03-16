import { ProjectType } from "./types";

export type RenderProps = {
  label: string;
  classes: {
    bg: string;
    content: string;
    border: string;
  };
};

export const ProjectTypeRenderProps: Record<ProjectType, RenderProps> = {
  [ProjectType.DESIGN]: {
    label: ProjectType.DESIGN,
    classes: {
      bg: "bg-ifr-green",
      content: "text-white fill-white",
      border: "border-[#014837] ring-[#014837]",
    },
  },
  [ProjectType.PRODUCT]: {
    label: ProjectType.PRODUCT,
    classes: {
      bg: "bg-ifr-product",
      content: "text-white fill-white",
      border: "border-[#0b1324] ring-[#0b1324]",
    },
  },
  [ProjectType.SERVICE]: {
    label: ProjectType.SERVICE,
    classes: {
      bg: "bg-ifr-service",
      content: "text-white fill-white",
      border: "border-[#570093] ring-[#570093]",
    },
  },
  [ProjectType.DPP]: {
    label: ProjectType.DPP,
    classes: {
      bg: "bg-ifr-dpp",
      content: "text-white fill-white",
      border: "border-[#9e3c00] ring-[#9e3c00]",
    },
  },
  [ProjectType.MACHINE]: {
    label: ProjectType.MACHINE,
    classes: {
      bg: "bg-[#D4E5D7]",
      content: "text-[#2D5035] fill-[#2D5035]",
      border: "border-[#6BA876] ring-[#6BA876]",
    },
  },
};
