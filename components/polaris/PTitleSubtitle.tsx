import { Stack } from "@bbtgnn/polaris-interfacer";

export interface Props {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  titleTag?: "h1" | "h2" | "h3";
}

// Section header typography aligned with the Figma prototype:
// title = Space Grotesk 20px/700, subtitle = IBM Plex Sans 14px subdued.
export default function PTitleSubtitle(props: Props) {
  const { title = "", subtitle = "", titleTag = "h1" } = props;

  return (
    <Stack vertical spacing="baseTight">
      {title && <Text_ as={titleTag}>{title}</Text_>}
      {subtitle && (
        <p
          className="m-0"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-regular)",
            color: "var(--ifr-text-secondary)",
            lineHeight: "1.5",
          }}
        >
          {subtitle}
        </p>
      )}
    </Stack>
  );
}

function Text_({ as: Tag, children }: { as: "h1" | "h2" | "h3"; children: React.ReactNode }) {
  return (
    <Tag
      className="m-0"
      style={{
        fontFamily: "var(--ifr-font-heading)",
        fontSize: "var(--ifr-fs-lg)",
        fontWeight: "var(--ifr-fw-bold)",
        color: "var(--ifr-text-primary)",
        lineHeight: "1.5",
      }}
    >
      {children}
    </Tag>
  );
}
