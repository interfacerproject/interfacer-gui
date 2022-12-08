import { useState } from "react";
import AssetsFilters from "./AssetsFilters";
import Spinner from "./brickroom/Spinner";
import cn from "classnames";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";

export interface CardsGroupProps {
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  header?: string;
  hideFilters?: boolean;
  children: React.ReactNode;
  onLoadMore: () => void;
  nextPage: boolean;
  loading: boolean;
}

const CardsGroup = (props: CardsGroupProps) => {
  const {
    header,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
    children,
    onLoadMore,
    loading,
    nextPage,
  } = props;

  const { t } = useTranslation("lastUpdatedProps");

  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <>
      {loading && (
        <div className="w-full">
          <Spinner />
        </div>
      )}
      {!loading && (
        <div className="flex flex-col">
          {/* Header */}
          {header && (
            <div className="flex items-center justify-between py-5">
              {/* Left side */}
              <h3>{header}</h3>

              {/* Right side */}
              {hideFilters && (
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
          )}
          <div className="flex flex-row flex-nowrap items-start space-x-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* CARDS */}
                {children}
              </div>
              {/* Pagination */}
              {!hidePagination && nextPage && (
                <div className="w-full pt-4 text-center">
                  <button className="text-center btn btn-primary" onClick={onLoadMore} disabled={!nextPage}>
                    {t("Load more")}
                  </button>
                </div>
              )}
            </div>
            {hideFilters && showFilter && (
              <div className="basis-96 sticky top-8">
                <AssetsFilters hidePrimaryAccountable={hidePrimaryAccountable} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default CardsGroup;
