import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SelectOption } from "components/types";
import { Agent, SearchAgentsQuery, SearchAgentsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import BrUserAvatar from "./brickroom/BrUserAvatar";

//

export interface Props {
  onSelect?: (value: FoundAgent) => void;
  excludeIDs?: Array<string>;
}

export default function SearchUsers(props: Props) {
  const { onSelect = () => {}, excludeIDs = [] } = props;
  const { t } = useTranslation();

  /* Polaris field logic */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /* Loading projects */

  // Loading agents (updates dynamically based on inputValue)
  const { data, loading } = useQuery<SearchAgentsQuery, SearchAgentsQueryVariables>(SEARCH_AGENTS, {
    variables: { text: inputValue, last: 5 },
  });

  function createOptionsFromData(data: SearchAgentsQuery | undefined): Array<SelectOption> {
    if (!data?.agents) return [];

    const options: Array<SelectOption> = data.agents.edges.map(agent => {
      return {
        value: agent.node.id,
        label: agent.node.name,
        media: <BrUserAvatar name={agent.node.name} size={24} />,
      };
    });

    const filteredOptions = options.filter(option => {
      return !excludeIDs.includes(option.value);
    });

    return filteredOptions;
  }

  const options = createOptionsFromData(data);

  /* Handling selection */

  function getAgentFromData(id: string): Agent | undefined {
    const agent = data?.agents?.edges.find(agent => agent.node.id === id);
    return agent?.node;
  }

  function handleSelect(selected: string[]) {
    const agent = getAgentFromData(selected[0]);
    if (!agent) return;
    onSelect(agent);
    setInputValue("");
  }

  /* Rendering */

  const textField = (
    <Autocomplete.TextField
      onChange={handleInputChange}
      autoComplete="off"
      label={t("Search for a user")}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="User name"
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}

//

export type FoundAgent = NonNullable<SearchAgentsQuery["agents"]>["edges"][number]["node"];

export const SEARCH_AGENTS = gql`
  query SearchAgents($text: String!, $last: Int) {
    agents(last: $last, filter: { name: $text }) {
      edges {
        node {
          id
          name
          note
          primaryLocation {
            id
            name
          }
        }
      }
    }
  }
`;
