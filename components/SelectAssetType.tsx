import { Dispatch, SetStateAction, useState } from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";
import { gql, useQuery } from "@apollo/client";

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
};

const SelectAssetType = ({ onChange, label, hint, error, assetType }: SelectAssetTypeProps) => {
  const [inputValue, setInputValue] = useState("");
  const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables.specs;
  const options =
    instanceVariables &&
    Object.keys(instanceVariables).map((key) => ({
      value: instanceVariables[key].id,
      label: instanceVariables[key].name,
    }));

  return (
    <>
      <BrSearchableSelect
        options={options}
        onChange={onChange}
        onInputChange={setInputValue}
        label={label}
        hint={hint}
        error={error}
        value={assetType}
        inputValue={inputValue}
        multiple
      />
    </>
  );
};

export default SelectAssetType;
