import BrTags from "./brickroom/BrTags";
import { EconomicResource } from "../lib/types";
import MdParser from "../lib/MdParser";

const AssetDetailOverview = ({ asset }: { asset: EconomicResource }) => {
  return (
    <>
      <div className="my-2" dangerouslySetInnerHTML={{ __html: MdParser.render(asset.note!) }} />
      <div className="mb-16">
        <BrTags tags={asset?.classifiedAs!} />
      </div>
    </>
  );
};

export default AssetDetailOverview;
