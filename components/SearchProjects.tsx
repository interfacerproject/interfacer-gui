import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { CfSearchProjectsQuery, CfSearchProjectsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";

//

export interface Props {
  onSelect?: (value: string) => void;
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

  const [variables, setVariables] = useState<CfSearchProjectsQueryVariables>({
    last: 5,
  });

  useEffect(() => {
    try {
      yup
        .string()
        .matches(/[0-7][0-9A-HJKMNP-TV-Z]{25}/)
        .required()
        .validateSync(inputValue);
      setVariables({
        last: 5,
        IDs: [inputValue],
      });
    } catch (e) {
      setVariables({
        last: 5,
        name: inputValue,
      });
    }
  }, [inputValue]);

  /* Loading projects */

  // Loading projects (re-runs based on variables change)
  const { data, loading } = useQuery<CfSearchProjectsQuery, CfSearchProjectsQueryVariables>(CF_SEARCH_PROJECTS, {
    variables,
  });

  const [options, setOptions] = useState<Array<SelectOption>>([]);

  // When data changes, update options listed in the autocomplete
  useEffect(() => {
    // Guard
    if (!data?.economicResources) return setOptions([]);

    // Preparing options
    const options: Array<SelectOption> = data.economicResources.edges.map(agent => {
      return {
        value: agent.node.id,
        label: agent.node.name,
        // media: <BrUserAvatar name={agent.node.name} size={24} />,
      };
    });

    // Filtering already selected options
    const filteredOptions = options.filter(option => {
      return !excludeIDs.includes(option.value);
    });

    setOptions(filteredOptions);
  }, [data]);

  /* Handling selection */

  // function getAgentFromData(id: string): Agent | undefined {
  //   const agent = data?.agents?.edges.find(agent => agent.node.id === id);
  //   return agent?.node;
  // }

  function handleSelect(selected: string[]) {
    onSelect(selected[0]);
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

export const CF_SEARCH_PROJECTS = gql`
  query CFSearchProjects($last: Int, $IDs: [ID!], $name: String) {
    economicResources(last: $last, filter: { id: $IDs, name: $name }) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
