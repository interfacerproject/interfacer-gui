import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { ProjectType, SelectOption } from "components/types";
import { QUERY_PROJECT_TYPES } from "lib/QueryAndMutation";
import { EconomicResource, GetProjectTypesQuery, SearchProjectsQuery, SearchProjectsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import * as yup from "yup";
import ProjectThumb from "./ProjectThumb";

//

export interface Props {
  onSelect?: (value: Partial<EconomicResource>) => void;
  excludeIDs?: Array<string>;
  label?: string;
  placeholder?: string;
  conformsTo?: Array<ProjectType>;
  id?: string;
}

export default function SearchProjects(props: Props) {
  const { t } = useTranslation();
  const {
    onSelect = () => {},
    excludeIDs = [],
    label = t("Search for a project"),
    conformsTo = [],
    placeholder = t("Search by resource name or Interfacer ID"),
    id,
  } = props;

  /* Getting project types */

  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES).data;
  const projectTypes: Record<ProjectType, string> | undefined = queryProjectTypes && {
    [ProjectType.DESIGN]: queryProjectTypes.instanceVariables.specs.specProjectDesign.id,
    [ProjectType.SERVICE]: queryProjectTypes.instanceVariables.specs.specProjectService.id,
    [ProjectType.PRODUCT]: queryProjectTypes.instanceVariables.specs.specProjectProduct.id,
  };

  /* Formatting GraphQL query variables based on input */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  let baseVariables: SearchProjectsQueryVariables = {
    last: 5,
    ...(conformsTo.length && projectTypes && { conformsTo: conformsTo.map(type => projectTypes[type]) }),
  };

  function createVariablesFromInput(input: string): SearchProjectsQueryVariables {
    try {
      // Checking if input is an Interfacer ID
      yup
        .string()
        .matches(/[0-7][0-9A-HJKMNP-TV-Z]{25}/)
        .required()
        .validateSync(input);
      return {
        ...baseVariables,
        IDs: [input],
      };
    } catch (e) {
      // If not, searching by name
      return {
        ...baseVariables,
        name: input,
      };
    }
  }

  const variables = createVariablesFromInput(inputValue);

  /* Loading projects */

  // Loading projects (re-runs based on variables change)
  const { data, loading } = useQuery<SearchProjectsQuery, SearchProjectsQueryVariables>(SEARCH_PROJECTS, {
    variables,
  });

  function createOptionsFromData(data: SearchProjectsQuery | undefined): Array<SelectOption> {
    if (!data?.economicResources) return [];

    const options: Array<SelectOption> = data.economicResources.edges.map(resource => {
      return {
        value: resource.node.id,
        label: `${resource.node.name} @${resource.node.primaryAccountable.name}`,
        // @ts-ignore
        media: <ProjectThumb project={resource.node} size="xs" />,
      };
    });

    const filteredOptions = options.filter(option => {
      return !excludeIDs.includes(option.value);
    });

    return filteredOptions;
  }

  const options = createOptionsFromData(data);

  /* Handling selection */

  function getProjectFromData(id: string): Partial<EconomicResource> | undefined {
    const project = data?.economicResources?.edges.find(project => project.node.id === id);
    return project?.node as Partial<EconomicResource>;
  }

  function handleSelect(selected: string[]) {
    const project = getProjectFromData(selected[0]);
    if (!project) return;
    onSelect(project);
    setInputValue("");
  }

  /* Rendering */

  const textField = (
    <Autocomplete.TextField
      id={id}
      onChange={handleInputChange}
      autoComplete="off"
      label={label}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder={placeholder}
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}

//

export const SEARCH_PROJECTS = gql`
  query SearchProjects($last: Int, $IDs: [ID!], $name: String, $conformsTo: [ID!]) {
    economicResources(last: $last, filter: { id: $IDs, name: $name, conformsTo: $conformsTo }) {
      edges {
        node {
          id
          name
          metadata
          conformsTo {
            id
            name
          }
          primaryAccountable {
            id
            name
          }
          images {
            hash
            name
            mimeType
            bin
          }
        }
      }
    }
  }
`;
