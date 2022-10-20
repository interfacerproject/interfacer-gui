import React from "react";

type BrTableProps = {
  headArray: Array<string>;
  children: React.ReactNode;
  emptyState?: string | React.ReactNode;
};

const BrTable = ({ headArray, children, emptyState = "0 results" }: BrTableProps) => {
  return (
    <>
      <div className="overflow-x-auto shadow-lg rounded-box">
        <div className="table w-full rounded-box">
          {/* The header */}
          <div className="table-header-group bg-white-100">
            <div className="table-row">
              {headArray.map(p => (
                <div className="table-cell p-4 text-sm font-normal text-neutral" key={p}>
                  {p}
                </div>
              ))}
            </div>
          </div>
          {/* The children */}
          <div className="bg-['#F9F9F7'] table-row-group">
            {children ? children : <div className="p-5">{emptyState}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default BrTable;
