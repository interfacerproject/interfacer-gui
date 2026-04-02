import { ProjectType } from "./types";

interface EntityTypeIconProps {
  type: ProjectType;
  size?: "default" | "small";
  className?: string;
  fill?: string;
}

// SVG path data extracted from DTEC 03/2026 prototype
const svgPaths = {
  // Design icon - compass/pen-nib
  design16:
    "M11 0L16 5L13 8V13L3 16L2.20711 15.2071L6.48196 10.9323C6.64718 10.9764 6.82084 11 7 11C8.10457 11 9 10.1046 9 9C9 7.89543 8.10457 7 7 7C5.89543 7 5 7.89543 5 9C5 9.17916 5.02356 9.35282 5.06774 9.51804L0.792893 13.7929L0 13L3 3H8L11 0Z",
  design12:
    "M8.25 0L12 3.75L9.75 6V9.75L2.25 12L1.65533 11.4053L4.86147 8.19922C4.98538 8.2323 5.11563 8.25 5.25 8.25C6.07843 8.25 6.75 7.57845 6.75 6.75C6.75 5.92157 6.07843 5.25 5.25 5.25C4.42157 5.25 3.75 5.92157 3.75 6.75C3.75 6.88437 3.76767 7.01461 3.8008 7.13853L0.59467 10.3447L0 9.75L2.25 2.25H6L8.25 0Z",

  // Product icon - price tag
  product16:
    "M15.6773 1.63893C15.659 1.29237 15.5149 0.964923 15.2728 0.719521C15.0307 0.474119 14.7077 0.328087 14.3658 0.309497L8.34938 0L0.507936 7.94844C0.182705 8.27821 0 8.72541 0 9.19171C0 9.658 0.182705 10.1052 0.507936 10.435L5.71244 15.7105C6.03777 16.0402 6.47895 16.2254 6.93896 16.2254C7.39898 16.2254 7.84016 16.0402 8.16549 15.7105L16 7.73742L15.6773 1.63893ZM13.1236 5.02229C12.9172 5.23423 12.6533 5.37917 12.3654 5.43867C12.0775 5.49818 11.7786 5.46956 11.5068 5.35646C11.235 5.24337 11.0024 5.05089 10.8388 4.80352C10.6752 4.55614 10.5878 4.26503 10.5878 3.96719C10.5878 3.66935 10.6752 3.37824 10.8388 3.13086C11.0024 2.88348 11.235 2.69101 11.5068 2.57791C11.7786 2.46481 12.0775 2.4362 12.3654 2.4957C12.6533 2.5552 12.9172 2.70014 13.1236 2.91208C13.3974 3.19315 13.5509 3.57222 13.5509 3.96719C13.5509 4.36216 13.3974 4.74123 13.1236 5.02229Z",
  product12:
    "M11.758 1.2292C11.7442 0.96928 11.6362 0.723692 11.4546 0.539641C11.273 0.355589 11.0308 0.246065 10.7743 0.232123L6.26204 0L0.380952 5.96133C0.137028 6.20866 0 6.54406 0 6.89378C0 7.2435 0.137028 7.5789 0.380952 7.82623L4.28433 11.7829C4.52832 12.0301 4.85921 12.169 5.20422 12.169C5.54923 12.169 5.88012 12.0301 6.12412 11.7829L12 5.80307L11.758 1.2292ZM9.84273 3.76672C9.68791 3.92568 9.48995 4.03438 9.27402 4.07901C9.05809 4.12363 8.83395 4.10217 8.63008 4.01735C8.42622 3.93252 8.25184 3.78817 8.12911 3.60264C8.00639 3.4171 7.94086 3.19877 7.94086 2.97539C7.94086 2.75201 8.00639 2.53368 8.12911 2.34815C8.25184 2.16261 8.42622 2.01826 8.63008 1.93343C8.83395 1.84861 9.05809 1.82715 9.27402 1.87178C9.48995 1.9164 9.68791 2.02511 9.84273 2.18406C10.0481 2.39486 10.1632 2.67916 10.1632 2.97539C10.1632 3.27162 10.0481 3.55592 9.84273 3.76672Z",

  // Service icon - multi-tool
  service16:
    "M15.5 5H14.793C14.665 5 14.537 5.049 14.439 5.146L11 8.586L7.414 5L10.853 1.561C10.951 1.463 11 1.335 11 1.207V0.5C11 0.224 10.776 0 10.5 0H6.793C6.665 0 6.537 0.049 6.439 0.146L3.146 3.439C3.049 3.537 3 3.665 3 3.793V8.586L0.146 11.44C0.049 11.537 0 11.665 0 11.793V12.207C0 12.335 0.049 12.463 0.146 12.561L3.439 15.854C3.537 15.951 3.665 16 3.793 16H4.207C4.335 16 4.463 15.951 4.561 15.854L7.414 13H12.207C12.335 13 12.463 12.951 12.561 12.854L15.854 9.561C15.951 9.463 16 9.335 16 9.207V5.5C16 5.224 15.776 5 15.5 5Z",
  service12:
    "M11.625 3.75H11.0948C10.9988 3.75 10.9028 3.78675 10.8293 3.8595L8.25 6.4395L5.5605 3.75L8.13975 1.17075C8.21325 1.09725 8.25 1.00125 8.25 0.90525V0.375C8.25 0.168 8.082 0 7.875 0H5.09475C4.99875 0 4.90275 0.03675 4.82925 0.1095L2.3595 2.57925C2.28675 2.65275 2.25 2.74875 2.25 2.84475V6.4395L0.1095 8.58C0.03675 8.65275 0 8.74875 0 8.84475V9.15525C0 9.25125 0.03675 9.34725 0.1095 9.42075L2.57925 11.8905C2.65275 11.9633 2.74875 12 2.84475 12H3.15525C3.25125 12 3.34725 11.9633 3.42075 11.8905L5.5605 9.75H9.15525C9.25125 9.75 9.34725 9.71325 9.42075 9.6405L11.8905 7.17075C11.9633 7.09725 12 7.00125 12 6.90525V4.125C12 3.918 11.832 3.75 11.625 3.75Z",

  // DPP icon - QR code composite (multiple paths)
  dpp16: [
    { d: "M0 8.83697H7.11382V15.9508H0V8.83697Z" },
    { d: "M8.78757 0.0492897H15.9014V7.16311H8.78757V0.0492897Z" },
    { d: "M8.78757 8.83697H12.3445V12.3939H8.78757V8.83697Z" },
    {
      d: "M7.11391 7.1632H0V0.0492897H7.11391V7.1632ZM2.40006 2.35079V4.86149H4.91076V2.35079H2.40006Z",
      fillRule: "evenodd" as const,
    },
    { d: "M12.4431 12.3939H16V15.9508H12.4431V12.3939Z" },
  ],
  dpp12: [
    { d: "M0 6.62773H5.33537V11.9631H0V6.62773Z" },
    { d: "M6.59068 0.0369768H11.926V5.37234H6.59068V0.0369768Z" },
    { d: "M6.59068 6.62773H9.25836V9.29542H6.59068V6.62773Z" },
    {
      d: "M5.33543 5.37241H0V0.0369768H5.33543V5.37241ZM1.80005 1.7631V3.64613H3.68307V1.7631H1.80005Z",
      fillRule: "evenodd" as const,
    },
    { d: "M9.33232 9.29541H12V11.9631H9.33232V9.29541Z" },
  ],
};

const iconConfig: Record<ProjectType, { viewBox16: string; viewBox12: string }> = {
  [ProjectType.DESIGN]: { viewBox16: "0 0 16 16", viewBox12: "0 0 12 12" },
  [ProjectType.PRODUCT]: { viewBox16: "0 0 16 16.2254", viewBox12: "0 0 12 12.169" },
  [ProjectType.SERVICE]: { viewBox16: "0 0 16 16", viewBox12: "0 0 12 12" },
  [ProjectType.DPP]: { viewBox16: "0 0 16 16", viewBox12: "0 0 12 12" },
  [ProjectType.MACHINE]: { viewBox16: "0 0 16 16", viewBox12: "0 0 12 12" },
};

function getSinglePath(type: ProjectType, size: "default" | "small"): string | null {
  const key = `${type.toLowerCase()}${size === "default" ? "16" : "12"}` as keyof typeof svgPaths;
  const val = svgPaths[key];
  return typeof val === "string" ? val : null;
}

function getMultiPaths(
  type: ProjectType,
  size: "default" | "small"
): Array<{ d: string; fillRule?: "evenodd" }> | null {
  const key = `${type.toLowerCase()}${size === "default" ? "16" : "12"}` as keyof typeof svgPaths;
  const val = svgPaths[key];
  return Array.isArray(val) ? val : null;
}

export default function EntityTypeIcon({
  type,
  size = "default",
  className,
  fill = "currentColor",
}: EntityTypeIconProps) {
  const config = iconConfig[type];
  if (!config) return null;

  const viewBox = size === "default" ? config.viewBox16 : config.viewBox12;
  const px = size === "default" ? 16 : 12;
  const singlePath = getSinglePath(type, size);
  const multiPaths = getMultiPaths(type, size);

  // Machine falls back to the Design icon (legacy type, no dedicated prototype icon)
  if (type === ProjectType.MACHINE) {
    return <EntityTypeIcon type={ProjectType.DESIGN} size={size} className={className} fill={fill} />;
  }

  return (
    <svg className={className} width={px} height={px} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
      {singlePath && <path d={singlePath} fill={fill} />}
      {multiPaths?.map((p, i) => (
        <path key={i} d={p.d} fill={fill} fillRule={p.fillRule} clipRule={p.fillRule} />
      ))}
    </svg>
  );
}
