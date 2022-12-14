import BrTags from "./brickroom/BrTags";
import { EconomicResource } from "../lib/types";
import MdParser from "../lib/MdParser";

const AssetDetailOverview = ({ asset }: { asset: EconomicResource }) => {
  return (
    <>
      <div className="mb-2 mt-4" dangerouslySetInnerHTML={{ __html: MdParser.render(asset.note!) }} />
      <div className="mb-16">
        <BrTags tags={asset?.classifiedAs!} />
      </div>
      <div className="font-semibold">{asset?.license}</div>
    </>
  );
};

export default AssetDetailOverview;
