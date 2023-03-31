import Link from "next/link";

interface LinkWrapperProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export default function LinkWrapper(props: LinkWrapperProps) {
  const { href, children, className = "" } = props;
  return (
    <Link href={href}>
      <a className={className}>{children}</a>
    </Link>
  );
}
