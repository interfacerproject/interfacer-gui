import { Button } from "@bbtgnn/polaris-interfacer";
import { AdjustmentsIcon } from "@heroicons/react/outline";
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
        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          {header ? <PTitleCounter title={header} titleTag="h2" length={length} /> : <div />}
          {!hideFilters && (
            <Button
              onClick={toggleFilter}
              outline={!showFilter}
              pressed={showFilter}
              icon={<AdjustmentsIcon className="w-5 h-5" />}
            >
              {t("Filter by")}
            </Button>
          )}
        </div>
        {/* Filters sit beside the results only where there is room for both;
            below `lg` they open above the list instead of squeezing it. */}
        <div className="flex flex-col-reverse lg:flex-row lg:flex-nowrap items-stretch lg:items-start gap-6 lg:gap-0 lg:space-x-8 w-full min-w-0">
          <div className="flex-1 min-w-0">{children}</div>
          {!hideFilters && showFilter && (
            <div className="w-full lg:w-auto lg:basis-96 lg:shrink-0 lg:sticky lg:top-8">
              <ProjectsFilters hidePrimaryAccountable={hidePrimaryAccountable} hideConformsTo={hideConformsTo} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WithFilterLayout;
