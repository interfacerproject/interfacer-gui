import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

const AssetDetailOverview = ({ asset }: { asset: EconomicResource }) => {
  const content = asset?.note ? asset.note.split("description:")[1] : "";
  return (
    <>
      <div className="my-2 prose" dangerouslySetInnerHTML={{ __html: MdParser.render(content) }} />
      <div className="mb-16">
        <BrTags tags={asset?.classifiedAs!} />
      </div>
    </>
  );
};

export default AssetDetailOverview;
