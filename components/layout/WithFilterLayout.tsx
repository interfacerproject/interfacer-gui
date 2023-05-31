import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import PTitleCounter from "components/polaris/PTitleCounter";
import ProjectsFilters from "components/ProjectsFilters";
import { useTranslation } from "next-i18next";
import { useState } from "react";

type WithFilterLayoutProps = {
  header?: boolean | string;
  hideFilters?: boolean;
  hidePrimaryAccountable?: boolean;
  hideConformsTo?: boolean;
  children: React.ReactNode;
  length?: number;
};

const WithFilterLayout = ({
  header = false,
  hideFilters = false,
  hidePrimaryAccountable = false,
  hideConformsTo = false,
  length = 0,
  children,
}: WithFilterLayoutProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const { t } = useTranslation("lastUpdatedProps");
  const toggleFilter = () => setShowFilter(!showFilter);
  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-5">
          {header ? <PTitleCounter title={header} titleTag="h2" length={length} /> : <div />}
          {!hideFilters && (
            <button
              onClick={toggleFilter}
              className={cn(
                "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
                { "bg-accent text-white-100": showFilter }
              )}
            >
              <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
            </button>
          )}
        </div>
        <div className="flex flex-row flex-nowrap items-start space-x-8 w-full">
          {children}
          {!hideFilters && showFilter && (
            <div className="basis-96 sticky top-8">
              <ProjectsFilters>
                {hideConformsTo && <ProjectsFilters.ConformsTo />}
                <ProjectsFilters.Tags />
                {hidePrimaryAccountable && <ProjectsFilters.PrimaryAccountable />}
              </ProjectsFilters>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WithFilterLayout;
