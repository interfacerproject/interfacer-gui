import React, {useState} from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";

const AssetsTable = ({assets, assetsHead}: { assets: Array<any>, assetsHead: Array<string> }) => {

    return (<>
        <BrTable headArray={assetsHead}>
            {assets.map((e) =>
                <tr key={e.cursor}>
                    <td>
                        <div className="flex max-w-xs min-w-[10rem]">
                           {e.node.primaryIntents[0].resourceInventoriedAs?.images[0] && <div className="w-2/5 flex-none">
                                <AssetImage
                                    image={{
                                        hash: e.node.primaryIntents[0].resourceInventoriedAs?.images[0]?.hash,
                                        mimeType: e.node.primaryIntents[0].resourceInventoriedAs?.images[0]?.hash
                                    }}
                                    className="mr-1 max-h-20"/>
                            </div>}
                            <Link href={`/asset/${e.node.id}`} className="flex-auto">
                                <a className="ml-1">
                                    <h3 className="whitespace-normal break-words">
                                        {e.node.primaryIntents[0].resourceInventoriedAs?.name}
                                    </h3>
                                </a>
                            </Link>
                        </div>
                    </td>
                    <td className="pl-1">
                        <h4>4 min ago</h4>
                        <h5 className="whitespace-normal">11:00 AM, 11/06/2022</h5>
                    </td>
                    <td>
                        <h3>{e.node.reciprocalIntents[0].resourceQuantity.hasNumericalValue}</h3>
                        <p className="text-primary">Fab Tokens</p>
                    </td>
                    <td>
                        <BrDisplayUser id={e.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.id}
                                       name={e.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}/>
                    </td>
                    <td className="max-w-[12rem]">
                        <BrTags tags={['this', 'tags', 'are', 'fakes']}/>
                    </td>
                </tr>
            )}
        </BrTable>
    </>)
}

export default AssetsTable
