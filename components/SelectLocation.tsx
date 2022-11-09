import { useQuery } from "@apollo/client";
import { getLocationOptions } from "lib/fetchLocation";
import { GET_TAGS } from "lib/QueryAndMutation";
import type { GetTagsQuery } from "lib/types";
import { forwardRef } from "react";

// Components
import BrSelectSearchableAsync, { BrSelectSearchableAsyncProps } from "./brickroom/BrSelectSearchableAsync";

//

export interface SelectLocationProps extends BrSelectSearchableAsyncProps, BrSelectSearchableAsyncProps {}

//

const SelectLocation = forwardRef<any, SelectLocationProps>((props, ref) => {
  const tags = useQuery<GetTagsQuery>(GET_TAGS).data?.economicResourceClassifications;

  // If no agents are found, return error
  // Next iteration of the component will use an async loading
  // ToDo – Return proper error
  if (!tags) return <></>;

  const promiseOptions = (inputValue: string) => getLocationOptions(inputValue);

  // const fetchResults = async () => {
  //     await fetch(`${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?q=${encodeURI(searchTerm)}`, { method: "get" }).then(
  //       async r => setOptions(JSON.parse(await r.text()).items)
  //     );
  //   };

  //   const fetchLocation = async (id: string) => {
  //     const data = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_LOOKUP}?id=${encodeURI(id)}`).then(async r =>
  //       JSON.parse(await r.text())
  //     );
  //     return { lat: data.position.lat, lng: data.position.lng };
  //   };

  return <BrSelectSearchableAsync cacheOptions loadOptions={promiseOptions} defaultOptions {...props} ref={ref} />;
});

//

SelectLocation.displayName = "SelectLocation";
export default SelectLocation;
