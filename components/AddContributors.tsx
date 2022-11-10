import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
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
export const QUERY_PEOPLE = gql`
  query ($query: String) {
    people(filter: { name: $query }) {
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
  const people = useQuery(QUERY_PEOPLE, { variables: { name: searchTerm } }).data?.people.edges.map(
    (agent: any) => agent.node
  );
  useEffect(() => {
    if (people && initialContributors && !hasChanged) {
      setContributors(people.filter((agent: any) => initialContributors?.includes(agent.id)));
      setHasChanged(true);
    }
  }, [hasChanged, initialContributors, people]);

  const handleSelect = (values: { value: string; label: string }[]) => {
    const updatedOptions = [...values].map((value: { value: string; label: string }) => ({
      id: value.value,
      name: value.label,
    }));
    setContributors(updatedOptions);
    setHasChanged(true);
  };
  return (
    <BrSearchableSelect
      multiple
      options={people?.map((contributor: { id: string; name: string }) => ({
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
