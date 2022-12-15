import { FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";

// Components
import Link from "next/link";
import AssetsTableRow from "./AssetsTableRow";
import BrTable from "./brickroom/BrTable";
import AgentsTableRow from "./AgentsTableRow";

//

export interface AssetsTableBaseProps {
  data: any;
  hidePagination?: boolean;
  onLoadMore?: () => void;
}

//

export default function AgentsTableBase(props: AssetsTableBaseProps) {
  const { data, hidePagination = false, onLoadMore = () => {} } = props;
  const { t } = useTranslation("lastUpdatedProps");

  const agents = data.agents?.edges;
  const hasNextPage = data.agents?.pageInfo.hasNextPage;
  const showEmptyState = !Boolean(agents) || agents?.length == 0;

  //

  return (
    <div>
      <BrTable headArray={[t(""), t("name"), t("id"), t("info")]}>
        {agents?.map((e: any) => (
          <AgentsTableRow agent={e} key={e.cursor} />
        ))}
      </BrTable>

      {/* Empty state */}
      {showEmptyState && (
        <div className="p-4 pt-6">
          <p className="pt-2 pb-5 font-light text-white-700">{t("empty_state_assets")}</p>
        </div>
      )}

      {/* Pagination */}
      {!hidePagination && (
        <div className="w-full pt-4 text-center">
          {hasNextPage && (
            <button className="text-center btn btn-primary" onClick={onLoadMore}>
              {t("Load more")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
