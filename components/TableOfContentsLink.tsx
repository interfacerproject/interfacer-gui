import classNames from "classnames";
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
    <a href={href}>
      <div className={classes}>{label}</div>
    </a>
  );
}
