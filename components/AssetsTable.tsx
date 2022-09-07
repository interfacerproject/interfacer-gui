import React, {useState} from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import QrCodeButton from "./brickroom/QrCodeButton";
import BrTags from "./brickroom/BrTags";
import Avatar from "boring-avatars";
import BrDisplayUser from "./brickroom/BrDisplayUser";

const AssetsTable = ({assets, assetsHead}: { assets: Array<any>, assetsHead:Array<string> }) => {

    return (<>
        <BrTable headArray={assetsHead}>
            {(assets?.length !== 0) && <>{assets.map((e) =>
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
            )}</>}
            {(assets?.length === 0) && <>
                <tr className="disabled">
                    <td>xxxxxxx</td>
                    <td>xxxxxx xxxx</td>
                    <td>xxxxxxxxxxxx xxx xxxxx</td>
                    <td className="whitespace-normal">xxxxx, xxxxxx xx</td>
                    <td><QrCodeButton id='' outlined={true}/></td>
                    <td className="p-1">
                        xxxxxxx
                    </td>
                    <td className="whitespace-normal">xxxxxxxxx xxxxxxxx xxxxxxxxxxxx xxxxxxxx xxxxxxxxxx xxxxxx xxxx
                    </td>

                </tr>
                <tr>
                    <td colSpan={assetsHead.length}>
                        <h4>There’s nothing to display here.</h4>
                        <p>
                            This table will display the assets.
                        </p>
                    </td>
                </tr>
            </>}
        </BrTable>
    </>)
}

export default AssetsTable