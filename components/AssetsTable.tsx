import React, {useState} from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";

const AssetsTable = ({assets, assetsHead}: { assets: Array<any>, assetsHead:Array<string> }) => {

    return (<>
        <BrTable headArray={assetsHead}>
            {assets.map((e) =>
                <tr key={e.cursor}>
                    <td>
                        <div className="flex">
                            <div className="w-2/5 flex-none">
                                <img src={`https://picsum.photos/120/120?random=${e.cursor}`} className="mr-1"/>
                            </div>
                            <Link href={`/asset/${e.node.id}`} className="flex-auto">
                                <a>
                                    <h3>{e.node.primaryIntents[0].resourceInventoriedAs?.name}</h3>
                                    <p className="whitespace-normal">{e.node.primaryIntents[0].resourceInventoriedAs?.note.split(':')[1].split(',')[0]}</p>
                                </a>
                            </Link>
                        </div>
                    </td>
                    <td>
                        <h4>4 min ago</h4>
                        <h5>11:00 AM, 11/06/2022</h5>
                    </td>
                    <td>
                        <h3>{e.node.reciprocalIntents[0].resourceQuantity.hasNumericalValue}</h3>
                        <p className="text-primary">Fab Tokens</p>
                    </td>
                    <td>
                        <BrDisplayUser id={e.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.id} name={e.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}/>
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