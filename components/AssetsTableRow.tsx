import React from "react";
import Link from "next/link";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";
import devLog from "../lib/devLog";

const AssetsTableRow = (props: any) => {
    const e = props.asset;
    const primaryIntent = e.node.primaryIntents[0];
    const reciprocalIntent = e.node.reciprocalIntents[0];
    return (
        <>
            {e && primaryIntent && (
                <tr>
                    <td>
                        <div className="grid grid-col-1 mx-auto md:mx-0 md:flex max-w-xs min-w-[10rem]">
                            {primaryIntent.resourceInventoriedAs?.images[0] && (
                                <div className="flex-none w-full md:w-2/5">
                                    <AssetImage
                                        image={
                                            primaryIntent.resourceInventoriedAs
                                                ?.images[0]
                                        }
                                        className="mr-1 max-h-20"
                                    />
                                </div>
                            )}
                            <Link
                                href={`/asset/${e.node.id}`}
                                className="flex-auto"
                            >
                                <a className="ml-1">
                                    <h3 className="break-words whitespace-normal">
                                        {
                                            primaryIntent.resourceInventoriedAs
                                                ?.name
                                        }
                                    </h3>
                                </a>
                            </Link>
                        </div>
                    </td>
                    <td className="">
                        {e.node?.created &&
                            new Date(e.node.created).toLocaleString()}
                    </td>
                    <td>
                        <h3>
                            {
                                reciprocalIntent.resourceQuantity
                                    .hasNumericalValue
                            }
                        </h3>
                        <p className="text-primary">Fab Tokens</p>
                    </td>
                    <td>
                        <BrDisplayUser
                            id={
                                primaryIntent.resourceInventoriedAs
                                    .primaryAccountable.id
                            }
                            name={
                                primaryIntent.resourceInventoriedAs
                                    .primaryAccountable.name
                            }
                        />
                    </td>
                    <td className="max-w-[12rem]">
                        <BrTags tags={primaryIntent?.resourceClassifiedAs} />
                    </td>
                </tr>
            )}
        </>
    );
};

export default AssetsTableRow;
