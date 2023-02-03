import licensesJSON from "lib/licenses/licenses.json";
import { License } from "lib/licenses/types";
import { useTranslation } from "next-i18next";
import { useCallback, useMemo, useState } from "react";

// Components
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";

//

export interface Option {
  value: string;
  label: string;
}

export interface Props {
  onSelect?: (value: string) => void;
  requiredIndicator?: boolean;
  error?: string;
}

export default function SearchLicense(props: Props) {
  const { onSelect = () => {}, requiredIndicator = false, error = "" } = props;
  const { t } = useTranslation();

  const licenses = licensesJSON.licenses as Array<License>;
  const deselectedOptions: Array<Option> = useMemo(
    () =>
      licenses.map(license => ({
        value: license.licenseId,
        label: license.name,
      })),
    [licenses]
  );

  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter(option => option.label.match(filterRegex));
      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  const updateSelection = useCallback(
    (selected: Array<string>) => {
      const selectedValue = selected.map(selectedItem => {
        const matchedOption = options.find(option => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });

      console.log(selected);

      setSelectedOptions(selected);
      if (selectedValue[0]) {
        onSelect(selected[0]);
        setInputValue(selectedValue[0]);
      }
    },
    [options, onSelect]
  );

  const handleClearButtonClick = useCallback(() => {
    setInputValue("");
    onSelect("");
  }, [onSelect]);

  //

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      autoComplete="off"
      label={t("Search for a license")}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="CERN, Apache, MIT, etc."
      requiredIndicator={requiredIndicator}
      clearButton
      onClearButtonClick={handleClearButtonClick}
      error={error}
    />
  );

  return <Autocomplete options={options} selected={selectedOptions} onSelect={updateSelection} textField={textField} />;
}
