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
  placeholder?: string;
  id?: string;
}

export default function SearchLocation(props: Props) {
  const { t } = useTranslation();
  const {
    onSelect = () => {},
    label = t("Search for an address"),
    placeholder = t("Street, number, city, country"),
    id,
  } = props;

  /* Searching locations */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const [options, setOptions] = useState<Array<SelectOption>>([]);
  const [searchResults, setSearchResults] = useState<Array<FetchLocation.Location>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toCoordValue = useCallback((location: FetchLocation.Location): string => {
    return location.position
      ? `COORD:${location.position.lat},${location.position.lng}|${encodeURIComponent(location.title)}`
      : location.id;
  }, []);

  useEffect(() => {
    const searchLocation = async () => {
      setLoading(true);
      const results = await fetchLocation(inputValue);
      setSearchResults(results);
      setOptions(
        results.map(location => ({
          value: toCoordValue(location),
          label: location.title,
        }))
      );
      setLoading(false);
    };
    searchLocation();
  }, [inputValue, toCoordValue]);

  /* Handling selection */

  async function handleSelect(selected: string[]) {
    const selectedValue = selected[0]?.trim();
    if (!selectedValue) {
      onSelect(null);
      return;
    }

    const matchedResult = searchResults.find(location => toCoordValue(location) === selectedValue);
    if (matchedResult?.position) {
      onSelect({
        title: matchedResult.title,
        id: matchedResult.id,
        language: matchedResult.language,
        resultType: matchedResult.resultType,
        administrativeAreaType: matchedResult.administrativeAreaType,
        address: {
          label: matchedResult.address.label,
          countryCode: matchedResult.address.countryCode,
          countryName: matchedResult.address.countryName,
          state: "",
        },
        position: {
          lat: matchedResult.position.lat,
          lng: matchedResult.position.lng,
        },
        mapView: {
          west: matchedResult.position.lng,
          south: matchedResult.position.lat,
          east: matchedResult.position.lng,
          north: matchedResult.position.lat,
        },
      });
      setInputValue("");
      return;
    }

    const location = await lookupLocation(selectedValue);
    if (!location) onSelect(null);
    else onSelect(location);
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
      error={props.error}
      helpText={props.helpText}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder={placeholder}
      requiredIndicator={props.requiredIndicator}
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}
