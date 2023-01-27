// Logic
import { useQuery } from "@apollo/client";
import { SEARCH_AGENTS } from "lib/QueryAndMutation";
import { SearchAgentsQuery, SearchAgentsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

// Components
import { Autocomplete, Icon, Text } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";

//

export interface SelectOption {
  value: string;
  label: string;
}

export interface Props {
  onSubmit?: (contributorsIDs: Array<string>) => void;
}

//

export default function ContributorsStep(props: Props) {
  const { onSubmit = () => {} } = props;
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");
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

  //

  const textField = (
    <Autocomplete.TextField
      onChange={value => {
        setInputValue(value);
      }}
      autoComplete="off"
      label="Contributors"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Search"
    />
  );

  return (
    <>
      <Text variant="heading3xl" as="h1">
        {t("Contributors")}
      </Text>
      <Text variant="bodyMd" as="p">
        {t("Tell us who contributed to this project and how.")}
      </Text>
      <Autocomplete
        options={options}
        selected={selection}
        onSelect={updateSelection}
        loading={loading}
        textField={textField}
      />
      {JSON.stringify(selection)}
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
