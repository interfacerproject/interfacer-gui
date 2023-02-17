import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SearchTagsQuery, SearchTagsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { SelectOption } from "./types";

//

export interface Props {
  exclude?: Array<string>;
}

export default function SearchTags(props: Props) {
  const { exclude = [] } = props;
  const { t } = useTranslation();

  /* Polaris field logic */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /* Loading projects */

  // Loading tags (updates dynamically based on inputValue)
  const { data, loading } = useQuery<SearchTagsQuery, SearchTagsQueryVariables>(SEARCH_TAGS, {
    variables: { text: inputValue },
  });

  console.log(data);

  function createOptionsFromData(data: SearchTagsQuery | undefined): Array<SelectOption> {
    const tags = data?.economicResourceClassifications;
    if (!tags) return [];

    const options: Array<SelectOption> = tags.map(tag => {
      return {
        value: tag,
        label: decodeURIComponent(tag),
      };
    });

    const filteredOptions = options.filter(option => {
      return !exclude.includes(option.value);
    });

    return filteredOptions;
  }

  const options = createOptionsFromData(data);

  function handleSelect(values: Array<string>) {
    console.log(values);
  }

  /* Rendering */

  const textField = (
    <Autocomplete.TextField
      onChange={handleInputChange}
      autoComplete="off"
      label={t("Search for a tag or create one")}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="software, hardware, 3D printing, etc."
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}

//

const SEARCH_TAGS = gql`
  query SearchTags($text: URI!) {
    economicResourceClassifications(filter: { uri: $text })
  }
`;
