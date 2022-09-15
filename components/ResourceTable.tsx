import React, { useState } from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import QrCodeButton from "./brickroom/QrCodeButton";

const truncate = (input: string, max: number) => input.length > max ? `${input.substring(0, max)}...` : input;


const ResourceTable = ({ resources }: { resources: Array<any> }) => {
    const resourcesHead = ['Resource', 'Source', 'License', 'Version']
    return (<>
        <BrTable headArray={resourcesHead}>
            {(resources?.length !== 0) && <>{resources?.map((e) =>
                <tr key={e.node.id}>
                    <td>
                        <Link href={`/resource/${e.node.id}`}>
                            <a className="flex items-center space-x-4">
                                <img src={e.node.metadata?.image} className="w-20 h-20" />
                                <div className="flex flex-col h-20 h-24 space-y-1 w-60">
                                    <h4 className="truncate w-60">{e.node.name}</h4>
                                    <p className="h-16 overflow-hidden text-sm whitespace-normal text-thin">{truncate(e.node.note, 100)}</p>
                                </div>
                            </a>
                        </Link>
                    </td>
                    <td className="align-top">
                        <span className="font-semibold">{e.node.metadata?.__meta?.source || ''}</span><br />
                        <Link href={e.node?.repo || ''}><a className="text-sm" target="_blank">{truncate(e.node.repo || '', 40)}</a></Link>
                    </td>
                    <td className="align-top">
                        <div className="whitespace-normal">
                            <p>
                                <span className="font-semibold">{e.node.license}</span><br />
                                <span className="italic">{('by')} {e.node.licensor}</span>
                            </p>
                        </div>
                    </td>
                    <td className="text-sm align-top">
                        Version: {e.node.version}<br />
                        {e.node.okhv}
                    </td>
                </tr>
            )}</>}
            {(resources?.length === 0) && <>
                <tr>
                    <td colSpan={resourcesHead.length}>
                        <h4>There’s nothing to display here.</h4>
                        <p>
                            This table will display the resources that you will have in inventory.
                            Raise, transfer or Produce a resource and it will displayed here.
                        </p>
                    </td>
                </tr>
            </>}


        </BrTable>


    </>)
}

export default ResourceTable
