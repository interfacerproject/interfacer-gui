import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import PTitleCounter from "components/polaris/PTitleCounter";
import ProjectsFilters from "components/ProjectsFilters";
import getChildrenOnDisplayName from "lib/getChildrenOnDisplayName";
import { useTranslation } from "next-i18next";
import { createContext, ReactNode, useContext, useState } from "react";

type WithFilterLayoutProps = {
  children: ReactNode[];
  length?: number;
  header?: string;
};

interface WithFilterLayoutContextValue {
  showFilter: boolean;
  toggleFilter: () => void;
  header?: string;
  length?: number;
}

export const WithFilterLayoutContext = createContext<WithFilterLayoutContextValue>({} as WithFilterLayoutContextValue);

export const useWithFilterLayout = () => useContext(WithFilterLayoutContext);

const WithFilterLayout = ({ length = 0, children, header }: WithFilterLayoutProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);
  const title = getChildrenOnDisplayName(children as JSX.Element[], "Header");
  const filterButton = getChildrenOnDisplayName(children as JSX.Element[], "FilterButton");
  const filter = getChildrenOnDisplayName(children as JSX.Element[], "Filter") || <ProjectsFilters />;
  const body = getChildrenOnDisplayName(children as JSX.Element[], "Body");

  return (
    <WithFilterLayoutContext.Provider value={{ showFilter, toggleFilter, length, header }}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-5">
          {title}
          {filterButton}
        </div>
        <div className="flex flex-row flex-nowrap items-start space-x-8 w-full">
          {body}
          {filter}
        </div>
      </div>
    </WithFilterLayoutContext.Provider>
  );
};

const Header = () => {
  const { header, length } = useWithFilterLayout();
  return <PTitleCounter title={header} titleTag="h2" length={length} />;
};

const FilterButton = () => {
  const { showFilter, toggleFilter } = useWithFilterLayout();
  const { t } = useTranslation("lastUpdatedProps");
  return (
    <button
      onClick={toggleFilter}
      className={cn(
        "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
        { "bg-accent text-white-100": showFilter }
      )}
    >
      <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
    </button>
  );
};

const Filter = ({ children }: { children?: JSX.Element }) => {
  const { showFilter } = useWithFilterLayout();
  return (
    <>
      {showFilter && (
        <div className="basis-96 sticky top-8">
          {!children && <ProjectsFilters />}
          {children}
        </div>
      )}
    </>
  );
};

const Body = ({ children }: { children: JSX.Element }) => children;

Filter.DisplayName = "Filter";
Header.DisplayName = "Header";
FilterButton.DisplayName = "FilterButton";
Body.DisplayName = "Body";

WithFilterLayout.Filter = Filter;
WithFilterLayout.Header = Header;
WithFilterLayout.FilterButton = FilterButton;
WithFilterLayout.Body = Body;

export default WithFilterLayout;
