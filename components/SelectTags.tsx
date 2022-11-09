import { gql, useQuery } from "@apollo/client";
import { formatSelectOption } from "components/brickroom/utils/BrSelectUtils";
import type { GetTagsQuery } from "lib/types";
import { forwardRef } from "react";

// Components
import BrSelectSearchable, { BrSelectSearchableProps } from "components/brickroom/BrSelectSearchable";

//

const GET_TAGS = gql`
  query GetTags {
    economicResourceClassifications
  }
`;

const SelectTags = forwardRef<any, BrSelectSearchableProps>((props, ref) => {
  const tags = useQuery<GetTagsQuery>(GET_TAGS).data?.economicResourceClassifications;

  // If no tags are found, return error
  // Next iteration of the component will use an async loading
  // ToDo – Return proper error
  if (!tags) return <></>;

  // Prepping options to input in Select
  const options = tags.map((tag: string) => formatSelectOption(tag, tag));

  return <BrSelectSearchable {...props} options={options} ref={ref} />;
});

//

SelectTags.displayName = "SelectTags";
export default SelectTags;
