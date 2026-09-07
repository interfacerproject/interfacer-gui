import { FormSectionContext } from "components/partials/create/formSectionContext";
import { useContext } from "react";

export interface Props {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  titleTag?: "h1" | "h2" | "h3";
  /** Appends the prototype's red asterisk to the heading. */
  required?: boolean;
}

// Section header typography aligned with the Figma prototype:
// title = Space Grotesk 20px/700, subtitle = IBM Plex Sans 16px/500 subdued.
export default function PTitleSubtitle(props: Props) {
  const { title = "", subtitle = "", titleTag = "h1", required = false } = props;
  const heading = (
    <>
      {title}
      {required && <span style={{ color: "var(--ifr-red)" }}>{" *"}</span>}
    </>
  );
  const section = useContext(FormSectionContext);

  if (section) {
    // The page itself owns the h1, so a section heading nests under it.
    const sectionTag = titleTag === "h1" ? "h2" : titleTag;
    return (
      <div className="w-full pb-8" style={{ borderBottom: "1px solid var(--ifr-border)" }}>
        <div className="flex gap-4 items-start w-full">
          <div
            className="shrink-0"
            style={{
              width: "var(--ifr-section-icon-size)",
              height: "var(--ifr-section-icon-size)",
              borderRadius: "16px",
              backgroundColor: section.accent,
            }}
          />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {title && <Text_ as={sectionTag}>{heading}</Text_>}
            {subtitle && (
              <Subtitle_ size="var(--ifr-fs-md)" weight="var(--ifr-fw-medium)">
                {subtitle}
              </Subtitle_>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {title && <Text_ as={titleTag}>{heading}</Text_>}
      {subtitle && (
        <Subtitle_ size="var(--ifr-fs-base)" weight="var(--ifr-fw-regular)">
          {subtitle}
        </Subtitle_>
      )}
    </div>
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
        lineHeight: "30px",
      }}
    >
      {children}
    </Tag>
  );
}

function Subtitle_({ size, weight, children }: { size: string; weight: string; children: React.ReactNode }) {
  return (
    <p
      className="m-0"
      style={{
        fontFamily: "var(--ifr-font-body)",
        fontSize: size,
        fontWeight: weight,
        color: "var(--ifr-text-secondary)",
        lineHeight: "24px",
      }}
    >
      {children}
    </p>
  );
}
