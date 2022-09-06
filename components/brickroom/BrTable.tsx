import React from 'react';

type BrTableProps = {
    headArray: Array<string>,
    children: React.ReactNode
}

const BrTable = ({ headArray, children }: BrTableProps) => {

    return (<>
        <div className="overflow-x-auto shadow-lg rounded-box">
            <div className="table w-full rounded-box">
                <div className="table-header-group bg-white">
                    <tr>
                        {headArray.map((p) => <th key={p}>{p}</th>)}
                    </tr>
                </div>
                <div className="bg-['#F9F9F7'] table-row-group">
                    {children}
                </div>
            </div>

        </div>
    </>
    );
}

export default BrTable