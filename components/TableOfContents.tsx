import { Text } from "@bbtgnn/polaris-interfacer";
import Link from "next/link";
import React from "react";

export interface Props {
  title?: string;
  links?: Array<{ label: string | React.ReactNode; href: string }>;
}

export default function TableOfContents(props: Props) {
  const { title = "", links = [] } = props;

  return (
    <div className="space-y-3">
      <>
        {title && (
          <div className="border-b-1 pb-1 border-border-subdued ">
            <Text as="p" variant="bodySm" color="subdued">
              <span className="uppercase font-bold">{title}</span>
            </Text>
          </div>
        )}

        {links.map(link => (
          <div key={link.href}>
            <Link href={link.href}>
              <a className="hover:underline">{link.label}</a>
            </Link>
          </div>
        ))}
      </>
    </div>
  );
}
