import { formatSelectOption } from "components/brickroom/utils/BrSelectUtils";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_ASSET_TYPES } from "lib/QueryAndMutation";
import { GetAssetTypesQuery } from "lib/types";

// Components
import BrSearchableSelect, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

export default function SelectAssetType(props: BrSelectSearchableProps) {
  // Loading asset types
  const assetTypes = useQuery<GetAssetTypesQuery>(QUERY_ASSET_TYPES).data?.instanceVariables.specs;

  // If assetTypes are not loaded, don't show the component
  if (!assetTypes) return <></>;

  // Prepping options
  const options = [
    formatSelectOption(assetTypes.specProjectDesign.name, assetTypes.specProjectDesign.id),
    formatSelectOption(assetTypes.specProjectProduct.name, assetTypes.specProjectProduct.id),
    formatSelectOption(assetTypes.specProjectService.name, assetTypes.specProjectService.id),
  ];

  //

  return <BrSearchableSelect options={options} isMulti {...props} />;
}
