import { Text } from "@bbtgnn/polaris-interfacer";
import React from "react";
import TableOfContentsLink from "./TableOfContentsLink";

export interface TOCLink {
  label: string | React.ReactNode;
  href: string;
}

export interface Props {
  title?: string;
  links?: Array<TOCLink>;
  isCurrent?: (link: TOCLink) => boolean;
}

export default function TableOfContents(props: Props) {
  const { title = "", links = [], isCurrent = () => false } = props;

  return (
    <div className="space-y-2">
      {title && (
        <div className="border-b-1 pb-1 border-border-subdued px-2">
          <Text as="p" variant="bodySm" color="subdued">
            <span className="uppercase font-bold">{title}</span>
          </Text>
        </div>
      )}

      <div className="space-y-1">
        {links.map(link => (
          <TableOfContentsLink key={link.href} href={link.href} label={link.label} isCurrent={isCurrent(link)} />
        ))}
      </div>
    </div>
  );
}
