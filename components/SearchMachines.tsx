import { useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SelectOption } from "components/types";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { MACHINE_TYPES } from "lib/resourceSpecs";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

//

interface Machine {
  id: string;
  name: string;
  note?: string | null;
  metadata?: string | null;
}

interface QueryData {
  economicResources: {
    edges: Array<{
      node: Machine;
    }>;
  };
}

export interface Props {
  onSelect?: (machine: Machine) => void;
  excludeIDs?: Array<string>;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function SearchMachines(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const {
    onSelect = () => {},
    excludeIDs = [],
    label = t("Search for machines"),
    placeholder = t("Search by machine name"),
  } = props;

  /* Polaris field logic */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /* Loading machines */

  const { specMachine } = useResourceSpecs();
  const { data, loading } = useQuery<QueryData>(QUERY_MACHINES, {
    variables: {
      resourceSpecId: specMachine?.id,
    },
    skip: !specMachine?.id,
  });

  function getMachineIcon(machineName: string): string {
    const machineType = MACHINE_TYPES.find(m => m.name === machineName);
    return machineType?.icon || "wrench";
  }

  function createOptionsFromData(data: QueryData | undefined): Array<SelectOption> {
    if (!data?.economicResources?.edges) return [];

    const machines = data.economicResources.edges.map(edge => edge.node);

    // Filter by search input
    const filtered = inputValue
      ? machines.filter(machine => machine.name.toLowerCase().includes(inputValue.toLowerCase()))
      : machines;

    const options: Array<SelectOption> = filtered.map(machine => {
      const icon = getMachineIcon(machine.name);
      return {
        value: machine.id,
        label: machine.name,
        media: (
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
            <span className="text-xs">{icon === "wrench" ? "🔧" : getIconEmoji(icon)}</span>
          </div>
        ),
      };
    });

    // Exclude already selected machines
    const filteredOptions = options.filter(option => {
      return !excludeIDs.includes(option.value);
    });

    return filteredOptions;
  }

  function getIconEmoji(icon: string): string {
    const iconMap: Record<string, string> = {
      laser: "⚡",
      "printer-3d": "🖨️",
      cnc: "⚙️",
      solder: "🔥",
      pcb: "📟",
      vinyl: "✂️",
      oven: "🔥",
      wrench: "🔧",
    };
    return iconMap[icon] || "🔧";
  }

  const options = createOptionsFromData(data);

  /* Handling selection */

  function getMachineFromData(id: string): Machine | undefined {
    const edge = data?.economicResources?.edges.find(edge => edge.node.id === id);
    return edge?.node;
  }

  function handleSelect(selected: string[]) {
    const machine = getMachineFromData(selected[0]);
    if (!machine) return;
    onSelect(machine);
    setInputValue("");
  }

  /* Rendering */

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
