import { useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SelectOption } from "components/types";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { RESOURCE_SPEC_MATERIAL } from "lib/resourceSpecs";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

interface Material {
  id: string;
  name: string;
  note?: string | null;
  metadata?: string | null;
}

interface QueryData {
  economicResources: {
    edges: Array<{
      node: Material;
    }>;
  };
}

export interface Props {
  onSelect?: (material: Material) => void;
  excludeIDs?: Array<string>;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function SearchMaterials(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const {
    onSelect = () => {},
    excludeIDs = [],
    label = t("Search for materials"),
    placeholder = t("Search by material name"),
  } = props;

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const { data, loading } = useQuery<QueryData>(QUERY_MACHINES, {
    variables: {
      resourceSpecId: RESOURCE_SPEC_MATERIAL,
    },
    skip: !RESOURCE_SPEC_MATERIAL,
  });

  function createOptionsFromData(data: QueryData | undefined): Array<SelectOption> {
    if (!data?.economicResources?.edges) return [];

    const materials = data.economicResources.edges.map(edge => edge.node);

    const filtered = inputValue
      ? materials.filter(material => material.name.toLowerCase().includes(inputValue.toLowerCase()))
      : materials;

    const options: Array<SelectOption> = filtered.map(material => ({
      value: material.id,
      label: material.name,
    }));

    return options.filter(option => !excludeIDs.includes(option.value));
  }

  const options = createOptionsFromData(data);

  function getMaterialFromData(id: string): Material | undefined {
    const edge = data?.economicResources?.edges.find(edge => edge.node.id === id);
    return edge?.node;
  }

  function handleSelect(selected: string[]) {
    const material = getMaterialFromData(selected[0]);
    if (!material) return;
    onSelect(material);
    setInputValue("");
  }

  const textField = (
    <Autocomplete.TextField
      id={props.id}
      onChange={handleInputChange}
      autoComplete="off"
      label={label}
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder={placeholder}
    />
  );

  return (
    <Autocomplete options={options} selected={[]} onSelect={handleSelect} loading={loading} textField={textField} />
  );
}
