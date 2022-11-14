import { formatSelectOption, SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { GetAssetTypesQuery, ResourceSpecification } from "lib/types";

//

export function assetTypesQueryToArray(q: GetAssetTypesQuery): Array<ResourceSpecification> {
  const data = q.instanceVariables.specs;
  return [data.specProjectDesign, data.specProjectProduct, data.specProjectService];
}

export function assetTypesQueryToSelectOptions(q: GetAssetTypesQuery): Array<SelectOption<string>> {
  return assetTypesQueryToArray(q).map(t => formatSelectOption(t.name, t.id));
}
