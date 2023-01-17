import { EconomicResource, FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";

// Components
import Link from "next/link";
import ProjectsTableRow from "./ProjectsTableRow";
import BrTable from "./brickroom/BrTable";

//

export interface ProjectsTableBaseProps {
  projects: EconomicResource[];
  hidePagination?: boolean;
  onLoadMore?: () => void;
  showEmptyState?: boolean;
  hasNextPage?: boolean;
}

//

export default function ProjectsTableBase(props: ProjectsTableBaseProps) {
  const { projects, hidePagination = false, onLoadMore = () => {}, showEmptyState = !projects, hasNextPage } = props;
  const { t } = useTranslation("lastUpdatedProps");

  return (
    <div>
      <BrTable headArray={[t("Project"), t("Project Type"), t("Last update"), t("tags"), t("Owner")]}>
        {projects?.map((e: any) => (
          <ProjectsTableRow project={e} key={e.cursor} />
        ))}
      </BrTable>

      {/* Empty state */}
      {showEmptyState && (
        <div className="p-4 pt-6">
          <h4>{t("Create a new project")}</h4>
          <p className="pt-2 pb-5 font-light text-white-700">{t("empty_state_projects")}</p>
          <Link href="/create_project">
            <a className="btn btn-accent btn-md">{t("Create project")}</a>
          </Link>
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
