import { Text } from "@bbtgnn/polaris-interfacer";
import classNames from "classnames";
import Link from "next/link";

export default function BrTag(props: { tag: string }) {
  const { tag } = props;
  const classes = classNames("py-1 px-2", "bg-primary/5 hover:bg-primary/20", "border-1 border-primary/20 rounded-md");

  return (
    <Link href={`/products?tags=${tag}`}>
      <a key={tag} className={classes}>
        <Text as="span" variant="bodyMd">
          <span className="text-primary whitespace-nowrap">{decodeURI(tag)}</span>
        </Text>
      </a>
    </Link>
  );
}
