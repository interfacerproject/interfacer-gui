import Link from "next/link";

type Crumb = {
  name: string;
  href: string;
};

const BrBreadcrumb = ({ crumbs }: { crumbs: Crumb[] }) => {
  return (
    <div className="text-primary breadcrumbs">
      <ul>
        {crumbs.map((crumb, i) => {
          return (
            <li key={i}>
              <Link href={crumb.href}>
                <a>{crumb.name}</a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BrBreadcrumb;
