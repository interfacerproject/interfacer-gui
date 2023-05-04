import Link from "next/link";

interface LinkWrapperProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  openInNewTab?: boolean;
}

export default function LinkWrapper(props: LinkWrapperProps) {
  const { href, children, className = "", openInNewTab = false } = props;
  return (
    <Link href={href}>
      <a className={className} target={openInNewTab ? "_blank" : "_self"}>
        {children}
      </a>
    </Link>
  );
}
