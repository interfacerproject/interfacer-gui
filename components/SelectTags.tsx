import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";

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
};

const SelectTags = ({ label, hint, error, placeholder, onChange, canCreateTags = false }: SelectAssetTypeProps) => {
  const [inputValue, setInputValue] = useState("");
  const tags = useQuery(QUERY).data?.economicResourceClassifications;
  const options =
    tags &&
    tags.map((tag: string) => ({
      value: tag,
      label: tag,
    }));
  const getTags = (tags: { value: string; label: string; __isNew__?: boolean }[]) => {
    onChange(tags.map(tag => tag.value));
  };

  return (
    <>
      <BrSearchableSelect
        options={options}
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
