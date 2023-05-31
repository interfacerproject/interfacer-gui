import { Text } from "@bbtgnn/polaris-interfacer";
import { Close } from "@carbon/icons-react";
import classNames from "classnames";
import Link from "next/link";

export default function BrTag(props: { tag: string; onRemove?: () => void }) {
  const { tag, onRemove } = props;
  const classes = classNames(
    "py-1 px-2",
    "bg-primary/5",
    { "hover:bg-primary/20": !onRemove },
    "border-1 border-primary/20 rounded-md"
  );

  const LinkWrapper = ({ children }: { children: JSX.Element }) =>
    onRemove ? (
      <div className={classes}>{children}</div>
    ) : (
      <Link href={`/projects?tags=${tag}`}>
        <a className={classes}>{children}</a>
      </Link>
    );

  return (
    <LinkWrapper>
      <div className="flex flex-row items-center space-x-1">
        <Text as="span" variant="bodyMd">
          <span className="text-primary whitespace-nowrap">{decodeURI(tag)}</span>
        </Text>
        {onRemove && (
          <button className="border-0 bg-transparent" onClick={onRemove}>
            <Close className="w-4 h-4" />
          </button>
        )}
      </div>
    </LinkWrapper>
  );
}
