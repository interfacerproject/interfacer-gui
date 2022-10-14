import { EconomicResourceEdge } from "lib/types";
import { truncate } from "lib/utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";

export interface ResourceTableRowProps {
  edge: EconomicResourceEdge;
}

export default function ResourceTableRow({ edge }: ResourceTableRowProps) {
  // Loading translations
  const { t } = useTranslation("resourcesProps");

  // Shorthand
  const e = edge;

  return (
    <div className="table-row" key={e.node.id} data-test="resource-item">
      {/* Cell 1 */}
      <div className="table-cell">
        <Link href={`/resource/${e.node.id}`}>
          <a className="flex items-center space-x-4">
            <img src={e.node.metadata?.image} className="w-20 h-20" />
            <div className="flex flex-col h-24 space-y-1 w-60">
              <h4 className="truncate w-60">{e.node.name}</h4>
              <p className="h-16 overflow-hidden text-sm whitespace-normal text-thin">{truncate(e.node.note, 100)}</p>
            </div>
          </a>
        </Link>
      </div>

      {/* Cell 2 */}
      <div className="table-cell align-top">
        <span className="font-semibold">{e.node.metadata?.__meta?.source || ""}</span>
        <br />
        <Link href={e.node?.repo || ""}>
          <a className="text-sm" target="_blank">
            {truncate(e.node.repo || "", 40)}
          </a>
        </Link>
      </div>

      {/* Cell 3 */}
      <div className="table-cell align-top">
        <div className="whitespace-normal">
          <p>
            <span className="font-semibold">{e.node.license}</span>
            <br />
            <span className="italic">
              {t("by")} {e.node.licensor}
            </span>
          </p>
        </div>
      </div>

      {/* Cell 4 */}
      <div className="table-cell text-sm align-top">
        Version: {e.node.version}
        <br />
        {e.node.okhv}
      </div>
    </div>
  );
}
