import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrTags from "./brickroom/BrTags";

const AssetDetailOverview = ({ asset }: { asset: EconomicResource }) => {
  const content = asset.note!.split(":")[1]?.split(",")[0] ?? "";
  return (
    <>
      <div className="my-2" dangerouslySetInnerHTML={{ __html: MdParser.render(content) }} />
      <div className="mb-16">
        <BrTags tags={asset?.classifiedAs!} />
      </div>
    </>
  );
};

export default AssetDetailOverview;
