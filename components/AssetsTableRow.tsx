import React from "react";
import Link from "next/link";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";
import AvatarUsers from "./AvatarUsers";
import { useAuth } from "../hooks/useAuth";

const AssetsTableRow = (props: any) => {
  const { user } = useAuth();
  const e = props.asset;
  const primaryIntent = e.node.primaryIntents[0];
  const metadata = primaryIntent?.resourceInventoriedAs.metadata;
  const hasImage = primaryIntent?.resourceInventoriedAs?.images[0] || metadata?.image;
  const isMetadataImageString = typeof metadata?.image === "string";
  const metadataImage = metadata?.image && (isMetadataImageString ? metadata?.image : metadata?.image[0]);
  return (
    <>
      {e && primaryIntent && (
        <tr>
          <td>
            <div className="grid grid-col-1 mx-auto md:mx-0 md:flex max-w-xs min-w-[10rem]">
              {hasImage && (
                <div className="flex-none w-full md:w-2/5">
                  <AssetImage
                    image={primaryIntent.resourceInventoriedAs?.images[0] || metadataImage || ""}
                    className="mr-1 max-h-20"
                  />
                </div>
              )}
              <Link href={!!user ? `/asset/${e.node.id}` : "/sign_in"} className="flex-auto">
                <a className="ml-1">
                  <h3 className="break-words whitespace-normal">{primaryIntent.resourceInventoriedAs?.name}</h3>
                </a>
              </Link>
            </div>
          </td>
          <td className="">{e.node?.created && new Date(e.node.created).toLocaleString()}</td>
          <td>
            <BrDisplayUser
              id={primaryIntent.resourceInventoriedAs.primaryAccountable.id}
              name={primaryIntent.resourceInventoriedAs.primaryAccountable.name}
            />
            <AvatarUsers users={primaryIntent.resourceInventoriedAs.metadata?.contributors} />
          </td>
          <td className="max-w-[12rem]">
            <BrTags tags={primaryIntent?.resourceInventoriedAs.classifiedAs} />
          </td>
        </tr>
      )}
    </>
  );
};

export default AssetsTableRow;
