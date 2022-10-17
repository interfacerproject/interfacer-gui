import BrThumbinailsGallery from "./brickroom/BrThumbinailsGallery";
import BrTags from "./brickroom/BrTags";
import { EconomicResource } from "../lib/types";
import MdParser from "../lib/MdParser";

const AssetDetailOverview = ({ asset }: { asset: EconomicResource }) => {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: MdParser.render(asset.note!.split(":")[1].split(",")[0]) }} />
      <div id="tags">
        <BrTags tags={asset?.classifiedAs!} />
      </div>
      <BrThumbinailsGallery
        images={asset?.images?.filter(image => !!image.bin).map(image => `data:${image.mimeType};base64,${image.bin}`)}
      />
    </>
  );
};

export default AssetDetailOverview;
