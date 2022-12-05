import React from "react";
import Link from "next/link";
import BrTags from "./brickroom/BrTags";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import AssetImage from "./AssetImage";
import AvatarUsers from "./AvatarUsers";
import devLog from "../lib/devLog";

const AssetsTableRow = (props: any) => {
  const e = props.asset.node;
  devLog(e);
  const metadata = e.metadata;
  const isMetadataImageString = typeof metadata?.image === "string";
  const metadataImage = metadata?.image && (isMetadataImageString ? metadata?.image : metadata?.image[0]);
  const hasImage = e.images ? e.images[0] : metadataImage;
  return (
    <>
      {e && (
        <tr>
          <td>
            <div className="grid grid-col-1 mx-auto md:mx-0 md:flex max-w-xs min-w-[10rem]">
              {hasImage && (
                <div className="flex-none w-full md:w-2/5">
                  <AssetImage image={hasImage} className="mr-1 max-h-20" />
                </div>
              )}
              <Link href={`/asset/${e.id}`} className="flex-auto">
                <a className="ml-1">
                  <h3 className="break-words whitespace-normal">{e.name}</h3>
                </a>
              </Link>
            </div>
          </td>
          <td className="">{e.created && new Date(e.created).toLocaleString()}</td>
          <td>
            <BrDisplayUser id={e.primaryAccountable.id} name={e.primaryAccountable.name} />
            <AvatarUsers users={e.metadata?.contributors} />
          </td>
          <td className="max-w-[12rem]">
            <BrTags tags={e.classifiedAs} />
          </td>
        </tr>
      )}
    </>
  );
};

export default AssetsTableRow;
