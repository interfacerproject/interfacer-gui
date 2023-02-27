import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { ProjectType, SelectOption } from "components/types";
import { FetchLocation, fetchLocation, LocationLookup, lookupLocation } from "lib/fetchLocation";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import { PFieldInfoProps } from "./polaris/PFieldInfo";

//

export interface Props extends Partial<PFieldInfoProps> {
  onSelect?: (value: LocationLookup.Location | null) => void;
  excludeIDs?: Array<string>;
  label?: string;
  conformsTo?: Array<ProjectType>;
}

export default function SearchLocation(props: Props) {
  const { t } = useTranslation();
  const { onSelect = () => {}, label = t("Search for an address") } = props;

  /* Searching locations */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const [options, setOptions] = useState<Array<SelectOption>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const searchLocation = async () => {
      setLoading(true);
      setOptions(createOptionsFromResult(await fetchLocation(inputValue)));
      setLoading(false);
    };
    searchLocation();
  }, [inputValue]);

  function createOptionsFromResult(result: Array<FetchLocation.Location>): Array<SelectOption> {
    return result.map(location => {
      return {
        value: location.id,
        label: location.title,
      };
    });
  }

  /* Handling selection */

  async function handleSelect(selected: string[]) {
    const location = await lookupLocation(selected[0]);
    if (!location) onSelect(null);
    else onSelect(location);
    setInputValue("");
  }

  /* Rendering */

  const textField = (
    <Autocomplete.TextField
      onChange={handleInputChange}
      autoComplete="off"
      label={label}
      value={inputValue}
      error={props.error}
      helpText={props.helpText}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder={t("Street, number, city, country")}
      requiredIndicator={props.requiredIndicator}
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}
