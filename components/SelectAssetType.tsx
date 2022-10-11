import { Dispatch, SetStateAction, useEffect, useState } from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";
import { gql, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";

const QUERY_VARIABLES = gql`
  query {
    instanceVariables {
      specs {
        specProjectDesign {
          name
          id
        }
        specProjectProduct {
          name
          id
        }
        specProjectService {
          name
          id
        }
      }
    }
  }
`;

type SelectAssetTypeProps = {
  onChange: Dispatch<SetStateAction<{ value: string; label: string }[]>>;
  label?: string;
  hint?: string;
  error?: string;
  assetType: Array<{ value: string; label: string }>;
  testID?: string;
  initialTypes?: string[];
};

const SelectAssetType = ({ onChange, label, hint, error, assetType, initialTypes }: SelectAssetTypeProps) => {
  const [inputValue, setInputValue] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables.specs;
  const [value, setValue] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    if (instanceVariables) {
      assetType.length > 0 || hasChanged
        ? setValue(assetType)
        : setValue(
            Object.keys(instanceVariables)
              .filter(key => initialTypes?.includes(instanceVariables[key].id))
              .map(key => ({ value: instanceVariables[key].id, label: instanceVariables[key].name }))
          );
    }
  }, [instanceVariables, assetType, hasChanged]);

  const options =
    instanceVariables &&
    Object.keys(instanceVariables).map(key => ({
      value: instanceVariables[key].id,
      label: instanceVariables[key].name,
    }));
  const handleChange = (newValue: { value: string; label: string }[]) => {
    onChange(newValue);
    setHasChanged(true);
  };

  return (
    <>
      <BrSearchableSelect
        options={options}
        onChange={handleChange}
        onInputChange={setInputValue}
        label={label}
        hint={hint}
        error={error}
        value={value}
        inputValue={inputValue}
        multiple
      />
    </>
  );
};

export default SelectAssetType;
