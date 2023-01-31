// Logic
import { useQuery } from "@apollo/client";
import { SEARCH_AGENTS } from "lib/QueryAndMutation";
import { Agent, SearchAgentsQuery, SearchAgentsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

// Components
import { Autocomplete, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export interface SelectOption {
  value: string;
  label: string;
  media?: React.ReactElement;
}

export interface Props {
  onSubmit?: (contributorsIDs: Array<string>) => void;
}

//

export default function ContributorsStep(props: Props) {
  const { onSubmit = () => {} } = props;
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => setInputValue(value), []);

  const [options, setOptions] = useState<Array<SelectOption>>([]);
  const [selection, setSelection] = useState<Array<Agent>>([]);

  //

  // Loading agents (updates dynamically based on inputValue)
  const { data, loading } = useQuery<SearchAgentsQuery, SearchAgentsQueryVariables>(SEARCH_AGENTS, {
    variables: { text: inputValue, last: 5 },
  });

  // When data changes, update options listed in the autocomplete
  useEffect(() => {
    if (data && data.agents) {
      // Preparing options
      const options: Array<SelectOption> = data.agents.edges.map(agent => {
        return {
          value: agent.node.id,
          label: agent.node.name,
          media: <BrUserAvatar name={agent.node.name} size={24} />,
        };
      });

      // Filtering already selected options
      const filteredOptions = options.filter(option => {
        return !selection.map(a => a.id).includes(option.value);
      });

      setOptions(filteredOptions);
    } else {
      setOptions([]);
    }
  }, [data, selection]);

  //

  function getAgentFromData(id: string): Agent | undefined {
    const agent = data?.agents?.edges.find(agent => agent.node.id === id);
    return agent?.node;
  }

  function updateSelection(selected: Array<string>) {
    const id = selected[0];
    if (!id) return;
    const agent = getAgentFromData(id);
    if (!agent) return;
    setSelection([...selection, agent]);
  }

  function removeSelected(id: string) {
    const newSelection = selection.filter(item => item.id !== id);
    setSelection(newSelection);
  }

  //

  const textField = (
    <Autocomplete.TextField
      onChange={handleInputChange}
      autoComplete="off"
      label={t("Search for a user")}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="John Johnson"
    />
  );

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Contributors")} subtitle={t("Tell us who contributed to this project.")} />

      <Autocomplete
        options={options}
        selected={[]}
        onSelect={updateSelection}
        loading={loading}
        textField={textField}
      />

      {selection.length && (
        <Stack vertical spacing="tight">
          <Text variant="bodyMd" as="p">
            {t("Selected contributors")}
          </Text>
          {selection.map(contributor => (
            <PCardWithAction
              key={contributor.id}
              onClick={() => {
                removeSelected(contributor.id);
              }}
            >
              <BrUserDisplay user={contributor} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
