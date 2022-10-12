import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";

type AddContributorsProps = {
  initialContributors?: string[];
  contributors: Array<{ id: string; name: string }>;
  setContributors: (contributors: Array<{ id: string; name: string }>) => void;
  label?: string;
  hint?: string;
  error?: string;
  testID?: string;
};
export const QUERY_AGENTS = gql`
  query ($first: Int, $id: ID) {
    agents(first: $first, after: $id) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

const AddContributors = ({
  contributors,
  setContributors,
  label,
  hint,
  error,
  testID,
  initialContributors,
}: AddContributorsProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const agents = useQuery(QUERY_AGENTS).data?.agents.edges.map((agent: any) => agent.node);
  useEffect(() => {
    if (agents && !hasChanged && initialContributors) {
      setContributors(
        agents
          .filter((agent: any) => initialContributors?.includes(agent.id))
          .map((agent: any) => ({ id: agent.id, name: agent.name }))
      );
      setHasChanged(true);
    }
  }, [agents]);
  const filteredContributors = agents?.filter((contributor: { id: string; name: string }) =>
    contributor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (values: { value: string; label: string }[]) => {
    const updatedOptions = [...values].map((value: { value: string; label: string }) => ({
      id: value.value,
      name: value.label,
    }));
    devLog("contributors", updatedOptions);
    setContributors(updatedOptions);
    setHasChanged(true);
  };
  return (
    <BrSearchableSelect
      multiple
      options={filteredContributors?.map((contributor: { id: string; name: string }) => ({
        label: contributor?.name,
        value: contributor?.id,
      }))}
      onChange={handleSelect}
      onInputChange={setSearchTerm}
      inputValue={searchTerm}
      label={label}
      value={contributors?.map((contributor: { id: string; name: string }) => ({
        value: contributor.id,
        label: contributor.name,
      }))}
      hint={hint}
      error={error}
      testID={testID}
    />
  );
};
export default AddContributors;
