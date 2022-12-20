import { formatSelectOption, SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { GetProjectTypesQuery, ResourceSpecification } from "lib/types";

//

export function projectTypesQueryToArray(q: GetProjectTypesQuery): Array<ResourceSpecification> {
  const data = q.instanceVariables.specs;
  return [data.specProjectDesign, data.specProjectProduct, data.specProjectService];
}

export function projectTypesQueryToSelectOptions(q: GetProjectTypesQuery): Array<SelectOption<string>> {
  return projectTypesQueryToArray(q).map(t => formatSelectOption(t.name, t.id));
}
