import { projectTypesQueryToSelectOptions } from "lib/formatProjectTypes";

// Request
import { useQuery } from "@apollo/client";
import { QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { GetProjectTypesQuery } from "lib/types";

// Components
import BrSearchableSelect, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

export default function SelectProjectType(props: BrSelectSearchableProps) {
  // Loading project types
  const projectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES).data;

  // If projectTypes are not loaded, don't show the component
  if (!projectTypes) return <></>;

  // Prepping options
  const options = projectTypesQueryToSelectOptions(projectTypes);

  //

  return <BrSearchableSelect options={options} isMulti {...props} />;
}
