import { gql, useQuery } from "@apollo/client";
import { ActionListItemDescriptor, Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { CirclePlusMinor, SearchMinor } from "@shopify/polaris-icons";
import { SearchTagsQuery, SearchTagsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { FieldInfoProps } from "./polaris/types";
import { SelectOption } from "./types";

//

export interface Props extends Partial<FieldInfoProps> {
  exclude?: Array<string>;
  onSelect?: (value: string) => void;
  creatable?: boolean;
  fieldInfo?: FieldInfoProps;
}

export const defaultFieldInfo = {};

export default function SearchTags(props: Props) {
  const { t } = useTranslation();
  const {
    exclude = [],
    onSelect = () => {},
    creatable = false,
    label = t("Search for a tag or create one"),
    placeholder = t("software, hardware, 3D printing, etc."),
  } = props;

  /* Polaris field logic */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /* Loading projects */

  // Loading tags (updates dynamically based on inputValue)
  const { data, loading } = useQuery<SearchTagsQuery, SearchTagsQueryVariables>(SEARCH_TAGS, {
    variables: { text: encodeURIComponent(inputValue) },
  });

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
    onSelect(values[0]);
  }

  /* Rendering */

  const action: ActionListItemDescriptor = {
    accessibilityLabel: "Action label",
    content: `${t("Create")}: "${inputValue.trim()}"`,
    icon: CirclePlusMinor,
    onAction: () => {
      onSelect(encodeURIComponent(inputValue.trim()));
      setInputValue("");
    },
  };

  const isInputValid = inputValue.trim().length > 0;
  const displayAction = options.length === 0 && !loading && creatable && isInputValid;

  const textField = (
    <Autocomplete.TextField
      onChange={handleInputChange}
      autoComplete="off"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      label={label}
      requiredIndicator={props.requiredIndicator}
      placeholder={placeholder}
      error={props.error}
      helpText={props.helpText}
    />
  );

  return (
    <Autocomplete
      options={options}
      selected={[]}
      onSelect={handleSelect}
      loading={loading}
      textField={textField}
      actionBefore={displayAction ? action : undefined}
    />
  );
}

//

const SEARCH_TAGS = gql`
  query SearchTags($text: URI!) {
    economicResourceClassifications(filter: { uri: $text })
  }
`;
