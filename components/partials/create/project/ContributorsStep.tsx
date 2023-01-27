// Logic
import { useQuery } from "@apollo/client";
import { SEARCH_AGENTS } from "lib/QueryAndMutation";
import { SearchAgentsQuery, SearchAgentsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

// Components
import { Autocomplete, Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, SearchMinor } from "@shopify/polaris-icons";
import Avatar from "boring-avatars";

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
  const [selection, setSelection] = useState<Array<string>>([]);

  //

  // Loading agents (updates dynamically based on inputValue)
  const { data, loading } = useQuery<SearchAgentsQuery, SearchAgentsQueryVariables>(SEARCH_AGENTS, {
    variables: { text: inputValue, last: 5 },
  });

  // When data changes, update options listed in the autocomplete
  useEffect(() => {
    if (data && data.agents) {
      // Preparing options
      const options = data.agents.edges.map(agent => {
        return {
          value: agent.node.id,
          label: agent.node.name,
          media: (
            <Avatar
              size={50}
              name={agent.node.name}
              variant="beam"
              colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
            />
          ),
        };
      });

      // Filtering already selected options
      const filteredOptions = options.filter(option => {
        return !selection.includes(option.value);
      });

      setOptions(filteredOptions);
    } else {
      setOptions([]);
    }
  }, [data, selection]);

  function updateSelection(selected: Array<string>) {
    setSelection([...selection, ...selected]);
  }

  function removeSelected(id: string) {
    const newSelection = selection.filter(item => item !== id);
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
    <>
      <Stack vertical spacing="extraLoose">
        <Stack vertical spacing="extraTight">
          <Text variant="heading3xl" as="h1">
            {t("Contributors")}
          </Text>
          <Text variant="bodyMd" as="p">
            {t("Tell us who contributed to this project and how.")}
          </Text>
        </Stack>

        <Autocomplete
          options={options}
          selected={selection}
          onSelect={updateSelection}
          loading={loading}
          textField={textField}
        />

        {selection.length && (
          <Stack vertical spacing="tight">
            <Text variant="bodyMd" as="p">
              {t("Selected contributors")}
            </Text>
            {selection.map(contributorID => (
              <Card sectioned key={contributorID}>
                <Stack>
                  <Avatar
                    size={50}
                    name={contributorID}
                    variant="beam"
                    colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                  />
                  <p>{contributorID}</p>
                  <Button
                    icon={<Icon source={CancelMinor} color="base" />}
                    accessibilityLabel="Remove contributor"
                    onClick={() => {
                      removeSelected(contributorID);
                    }}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </>
    // <div className="contributors-step">
    // <div className="contributors-step__header">
    //     <h2 className="contributors-step__title">{t('create_project.contributors.title')}</h2>
    //     <p className="contributors-step__description">{t('create_project.contributors.description')}</p>
    // </div>
    // <div className="contributors-step__content">
    //     <div className="contributors-step__list">
    //     {contributors.map((contributor) => (
    //         <ContributorItem
    //         key={contributor.id}
    //         contributor={contributor}
    //         onRemove={handleRemoveContributor}
    //         />
    //     ))}
    //     </div>
    //     <div className="contributors-step__add">
    //     <AddContributorForm onAdd={handleAddContributor} />
    //     </div>
    // </div>
    // </div>
  );
}
