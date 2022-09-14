import Link from "next/link";
import BrTable from "./brickroom/BrTable";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";
import {decodeTime} from 'ulid';
import dayjs from 'dayjs';
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
var calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

const AssetsTable = ({assets, assetsHead}: { assets: Array<any>, assetsHead: Array<string> }) => {

    return (<>
        <BrTable headArray={assetsHead}>
            {assets.map((e) =>
                <tr key={e.cursor}>
                    <td>
                        <div className="flex max-w-xs min-w-[10rem]">
                           {e.node.primaryIntents[0].resourceInventoriedAs?.images[0] && <div className="flex-none w-2/5">
                                <AssetImage
                                    image={{
                                        hash: e.node.primaryIntents[0].resourceInventoriedAs?.images[0]?.hash,
                                        mimeType: e.node.primaryIntents[0].resourceInventoriedAs?.images[0]?.hash
                                    }}
                                    className="mr-1 max-h-20"/>
                            </div>}
                            <Link href={`/asset/${e.node.id}`} className="flex-auto">
                                <a className="ml-1">
                                    <h3 className="break-words whitespace-normal">
                                        {e.node.primaryIntents[0].resourceInventoriedAs?.name}
                                    </h3>
                                </a>
                            </Link>
                        </div>
                    </td>
                    <td className="">
                        {dayjs().calendar(dayjs(e.node.created))}
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
