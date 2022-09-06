import React, {useState} from "react";
import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import QrCodeButton from "./brickroom/QrCodeButton";

const ResourceTable = ({resources}: { resources: Array<any> }) => {
    const resourcesHead = ['Resource', 'Name', 'Quantity', 'Location', 'Passport', 'Owner', 'Notes']
    return (<>
        <BrTable headArray={resourcesHead}>
            {(resources?.length !== 0) && <>{resources?.map((e) =>
                <tr key={e.node.id}>
                    <td>{e.node.conformsTo?.name}</td>
                    <td><Link href={`/resource/${e.node.id}`}><a>{e.node.name}</a></Link></td>
                    <td>{e.node.onhandQuantity?.hasNumericalValue || e.node.accountingQuantity?.hasNumericalValue}</td>
                    <td className="whitespace-normal">{e.node.currentLocation?.mappableAddress}</td>
                    <td><QrCodeButton id={e.node.id} outlined={true}/></td>
                    <td className="p-1">
                        <Link href={`/profile/${e.node.primaryAccountable?.id}`}>
                            <a className="pl-0 grid grid-cols-1 items-center">
                                {e.node.primaryAccountable?.name}
                            </a>
                        </Link>
                    </td>
                    <td className="whitespace-normal">{e.node.note}</td>
                </tr>
            )}</>}
            {(resources?.length === 0) && <>
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
