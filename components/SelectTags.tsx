import { Dispatch, SetStateAction, useEffect, useState } from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";
import { gql, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";

const QUERY = gql`
  {
    economicResourceClassifications
  }
`;

type SelectAssetTypeProps = {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  onChange: (values: string[]) => void;
  canCreateTags?: boolean;
  testID?: string;
  initialTags?: string[];
  selectedTags?: string[];
};

const SelectTags = ({
  label,
  hint,
  error,
  placeholder,
  onChange,
  canCreateTags = false,
  initialTags,
  selectedTags,
}: SelectAssetTypeProps) => {
  const [inputValue, setInputValue] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const tags = useQuery(QUERY).data?.economicResourceClassifications;
  useEffect(() => {
    if (tags && !hasChanged && initialTags) {
      onChange(initialTags);
    }
  }, [tags]);

  const options =
    tags &&
    tags.map((tag: string) => ({
      value: tag,
      label: tag,
    }));
  const getTags = (tags: { value: string; label: string; __isNew__?: boolean }[]) => {
    onChange(tags.map(tag => tag.value));
    setHasChanged(true);
  };

  return (
    <>
      <BrSearchableSelect
        options={options}
        value={selectedTags?.map(tag => ({ value: tag, label: tag }))}
        onInputChange={setInputValue}
        onChange={getTags}
        label={label}
        hint={hint}
        error={error}
        placeholder={placeholder}
        inputValue={inputValue}
        multiple
        isCreatable={canCreateTags}
      />
    </>
  );
};

export default SelectTags;
