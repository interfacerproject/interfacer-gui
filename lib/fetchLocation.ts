import { formatSelectOption, SelectOption } from "components/brickroom/utils/BrSelectUtils";

//

// Fetches the location from the API
export async function fetchLocation(text: string): Promise<Array<FetchLocation.Location>> {
  if (!text) return [];

  const result = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?q=${encodeURI(text)}`, {
    method: "GET",
  });
  const data = (await result.json()) as FetchLocation.Response;
  console.log(data);
  return [...data.items];
}

// Loads the options for the async multiselect
export async function getLocationOptions(text: string): Promise<Array<SelectOption<string>>> {
  return (await fetchLocation(text)).map(l => formatSelectOption(l.title, l.id));
}

//

export declare module FetchLocation {
  export interface Address {
    label: string;
    countryCode: string;
    countryName: string;
  }

  export interface Title {
    start: number;
    end: number;
  }

  export interface CountryCode {
    start: number;
    end: number;
  }

  export interface Address2 {
    label: any[];
    countryCode: CountryCode[];
  }

  export interface Highlights {
    title: Title[];
    address: Address2;
  }

  export interface Location {
    title: string;
    id: string;
    language: string;
    resultType: string;
    administrativeAreaType: string;
    address: Address;
    highlights: Highlights;
  }

  export interface Response {
    items: Array<Location>;
  }
}
