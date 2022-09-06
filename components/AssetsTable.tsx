import React, {useState} from "react";
import Link from "next/link";


import BrTable from "./brickroom/BrTable";
import QrCodeButton from "./brickroom/QrCodeButton";

const AssetsTable = ({assets}: { assets: Array<any> }) => {
    const assetsHead = ['Asset', 'Last update', 'Value', 'Owner', 'tags']

    return (<>
        <BrTable headArray={assetsHead}>
            {(assets?.length !== 0) && <>{assets.map((e) =>
                <tr key={e.cursor}>
                    <td>
                        <Link href={`/asset/${e.node.id}`}>
                            <a>
                                <span>{e.node.primaryIntents[0].resourceInventoriedAs?.name}</span><br/>
                                <span>{e.node.primaryIntents[0].resourceInventoriedAs?.note.split(':')[1].split(',')[0]}</span>
                            </a>
                        </Link>
                    </td>
                    <td>date hour</td>
                    <td>{e.node.reciprocalIntents[0].resourceQuantity.hasNumericalValue}/{e.node.reciprocalIntents[0].resourceQuantity.hasUnit.label}</td>
                    <td>{e.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}</td>
                    <td>tags</td>
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