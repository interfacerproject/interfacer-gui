import { assetTypesQueryToSelectOptions } from "lib/formatAssetTypes";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_ASSET_TYPES } from "lib/QueryAndMutation";
import { GetAssetTypesQuery } from "lib/types";

// Components
import BrSearchableSelect, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

export default function SelectAssetType(props: BrSelectSearchableProps) {
  // Loading asset types
  const assetTypes = useQuery<GetAssetTypesQuery>(QUERY_ASSET_TYPES).data;

  // If assetTypes are not loaded, don't show the component
  if (!assetTypes) return <></>;

  // Prepping options
  const options = assetTypesQueryToSelectOptions(assetTypes);

  //

  return <BrSearchableSelect options={options} isMulti {...props} />;
}
