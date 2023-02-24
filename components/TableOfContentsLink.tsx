import classNames from "classnames";
import Link from "next/link";
import { TOCLink } from "./TableOfContents";

interface Props extends TOCLink {
  isCurrent: boolean;
}

export default function TableOfContentsLink(props: Props) {
  const { label, href, isCurrent } = props;

  const classes = classNames("px-2 py-1 rounded-md", "hover:cursor-pointer", {
    "hover:bg-surface-neutral-hovered": !isCurrent,
    "bg-surface-primary-selected-hovered/80": isCurrent,
  });

  return (
    <div className={classes}>
      <Link href={href}>
        <a className="">{label}</a>
      </Link>
    </div>
  );
}
