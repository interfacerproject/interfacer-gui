import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SearchProjectsQuery, SearchProjectsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import * as yup from "yup";
import ProjectThumb from "./ProjectThumb";

//

export interface Props {
  onSelect?: (value: SearchedProject) => void;
  excludeIDs?: Array<string>;
}

export default function SearchProjects(props: Props) {
  const { onSelect = () => {}, excludeIDs = [] } = props;
  const { t } = useTranslation();

  /* Formatting GraphQL query variables based on input */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  function createVariablesFromInput(input: string): SearchProjectsQueryVariables {
    try {
      // Checking if input is an Interfacer ID
      yup
        .string()
        .matches(/[0-7][0-9A-HJKMNP-TV-Z]{25}/)
        .required()
        .validateSync(input);
      return {
        last: 5,
        IDs: [input],
      };
    } catch (e) {
      // If not, searching by name
      return {
        last: 5,
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

  console.log(data);

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

  function getProjectFromData(id: string): SearchedProject | undefined {
    const project = data?.economicResources?.edges.find(project => project.node.id === id);
    return project?.node;
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
      onChange={handleInputChange}
      autoComplete="off"
      label={t("Search for a project")}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Project name or Interfacer ID"
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}

//

export interface SelectOption {
  value: string;
  label: string;
  media?: React.ReactElement;
}

export type SearchedProject = NonNullable<SearchProjectsQuery["economicResources"]>["edges"][number]["node"];

export const SEARCH_PROJECTS = gql`
  query SearchProjects($last: Int, $IDs: [ID!], $name: String) {
    economicResources(last: $last, filter: { id: $IDs, name: $name }) {
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
