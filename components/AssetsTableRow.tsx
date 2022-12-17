import { getResourceImage } from "lib/resourceImages";
import Link from "next/link";
import dayjs from "../lib/dayjs";
import AvatarUsers from "./AvatarUsers";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTags from "./brickroom/BrTags";
import ResourceCardThumb from "./ResourceThumb";

const AssetsTableRow = (props: any) => {
  const e = props.asset.node;

  const data = e.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime;
  const image = getResourceImage(e);

  if (!e) return <tr></tr>;

  return (
    <tr>
      <td className="hover:bg-gray-50 hover:cursor-pointer rounded-md">
        <Link href={`/asset/${e.id}`}>
          <div className="flex items-center space-x-4">
            <div className="shrink-0">
              <ResourceCardThumb image={image} />
            </div>
            <h3 className="break-words whitespace-normal">{e.name}</h3>
            {/* <p className="text-sm text-gray-500">{e.note}</p> */}
          </div>
        </Link>
      </td>

      <td>{e.conformsTo?.name}</td>

      <td className="">
        <p className="mr-1">{dayjs(data).fromNow()}</p>
        <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      </td>

      <td className="max-w-[12rem]">
        <BrTags tags={e.classifiedAs} />
      </td>

      <td>
        <BrDisplayUser id={e.primaryAccountable.id} name={e.primaryAccountable.name} />
        <AvatarUsers users={e.metadata?.contributors} />
      </td>
    </tr>
  );
};

export default AssetsTableRow;
