import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import PTitleCounter from "components/polaris/PTitleCounter";
import ProjectsFilters from "components/ProjectsFilters";
import { useTranslation } from "next-i18next";
import { createContext, ReactNode, useContext, useState } from "react";

type WithFilterLayoutProps = {
  children: ReactNode;
  length?: number;
  header?: string;
  filter?: ReactNode;
};

interface WithFilterLayoutContextValue {
  showFilter: boolean;
  toggleFilter: () => void;
  header?: string;
  length?: number;
}

export const WithFilterLayoutContext = createContext<WithFilterLayoutContextValue>({} as WithFilterLayoutContextValue);

export const useWithFilterLayout = () => useContext(WithFilterLayoutContext);

const WithFilterLayout = (props: WithFilterLayoutProps) => {
  const { length = 0, children, header, filter = <ProjectsFilters /> } = props;
  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <WithFilterLayoutContext.Provider value={{ showFilter, toggleFilter, length, header }}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-5">
          {header ? <PTitleCounter title={header} titleTag="h2" length={length} /> : <div />}
          <FilterButton />
        </div>
        <div className="flex flex-row flex-nowrap items-start space-x-8 w-full">
          {children}
          {showFilter && <div className="basis-96 sticky top-8">{filter}</div>}
        </div>
      </div>
    </WithFilterLayoutContext.Provider>
  );
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

export default WithFilterLayout;
