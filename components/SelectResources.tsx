import { gql, useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import { EconomicResource, FetchInventoryQuery } from "lib/types";
import { forwardRef, useState } from "react";

export const FETCH_RESOURCES = gql`
  query FetchResources($filter: EconomicResourceFilterParams) {
    economicResources(last: 10, filter: $filter) {
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

// Components
import BrSelectSearchable, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";
import { formatSelectOption, SelectOption } from "./brickroom/utils/BrSelectUtils";

//

export interface SelectResourcesProps extends BrSelectSearchableProps {}

export type ResourceOption = SelectOption<EconomicResource>;

//

const SelectResources = forwardRef<any, SelectResourcesProps>((props, ref) => {
  const [input, setInput] = useState("");
  const { user } = useAuth();

  const resources = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { filter: { name: input } },
  }).data?.economicResources?.edges.map(a => a.node);

  // Preparing the options for the component
  let options: Array<any> = [];
  if (resources?.length) options = resources.map(a => formatSelectOption(a.name, a));

  return <BrSelectSearchable {...props} options={options} ref={ref} onInputChange={setInput} />;
});

//

SelectResources.displayName = "Select Resources";
export default SelectResources;
