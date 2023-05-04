import { Button, Text } from "@bbtgnn/polaris-interfacer";
import { Close } from "@carbon/icons-react";
import Link from "next/link";
import { Link as ILink } from "./AddLink";
import Card from "./Card";

interface Props {
  image?: string;
  heading?: string;
  description?: string;
  primaryAction?: ILink;
}

export default function EmptyState(props: Props) {
  const { image, heading, description, primaryAction } = props;

  return (
    <Card>
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        <div
          className={`w-32 h-32 shrink-0 rounded-full flex items-center justify-center ${!image ? "bg-gray-100" : ""}`}
        >
          {image && <img className="w-full h-full object-cover" src={image} alt={heading} />}
          {!image && (
            <div className="text-text-subdued">
              {/* @ts-ignore */}
              <Close size={60} />
            </div>
          )}
        </div>

        {(heading || description) && (
          <div className="flex flex-col items-center justify-center space-y-2">
            {heading && (
              <Text as="h2" variant="headingLg" color="subdued">
                {heading}
              </Text>
            )}
            {description && (
              <Text as="p" variant="bodyMd" color="subdued">
                {description}
              </Text>
            )}
          </div>
        )}

        {primaryAction && (
          <Link href={primaryAction.url}>
            <Button>{primaryAction.label}</Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
