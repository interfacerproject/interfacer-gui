import { gql, useQuery } from "@apollo/client";
import { Autocomplete, Icon } from "@bbtgnn/polaris-interfacer";
import { SearchMinor } from "@shopify/polaris-icons";
import { SelectOption } from "components/types";
import { Person, PersonFilterParams, SearchPeopleQuery, SearchPeopleQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import BrUserAvatar from "./brickroom/BrUserAvatar";

//

export interface Props {
  onSelect?: (value: Partial<Person>) => void;
  excludeIDs?: Array<string>;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function SearchUsers(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const {
    onSelect = () => {},
    excludeIDs = [],
    label = t("Search for a user"),
    placeholder = t("Search by username"),
  } = props;

  /* Polaris field logic */

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  /* Loading projects */

  const filter: PersonFilterParams = {
    userOrName: inputValue,
  };

  const { data, loading } = useQuery<SearchPeopleQuery, SearchPeopleQueryVariables>(SEARCH_PEOPLE, {
    variables: {
      last: 12,
      filter: inputValue ? filter : undefined,
    },
  });

  function createOptionsFromData(data: SearchPeopleQuery | undefined): Array<SelectOption> {
    if (!data?.people) return [];

    const options: Array<SelectOption> = data.people.edges.map(person => {
      return {
        value: person.node.id,
        label: `${person.node.user} (${person.node.name})`,
        media: <BrUserAvatar name={person.node.name} size={24} />,
      };
    });

    const filteredOptions = options.filter(option => {
      return !excludeIDs.includes(option.value);
    });

    return filteredOptions;
  }

  const options = createOptionsFromData(data);

  /* Handling selection */

  function getPersonFromData(id: string): Partial<Person> | undefined {
    const person = data?.people?.edges.find(person => person.node.id === id);
    return person?.node;
  }

  function handleSelect(selected: string[]) {
    const person = getPersonFromData(selected[0]);
    if (!person) return;
    onSelect(person);
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

//

export const SEARCH_PEOPLE = gql`
  query SearchPeople($filter: PersonFilterParams, $last: Int) {
    people(last: $last, filter: $filter) {
      edges {
        node {
          id
          name
          user
          note
          primaryLocation {
            id
            name
          }
        }
      }
    }
  }
`;
