// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { formatSelectOption, SelectOption } from "components/brickroom/utils/BrSelectUtils";

//

// Fetches the location from the API
export async function fetchLocation(text: string): Promise<Array<FetchLocation.Location>> {
  if (!text) return [];

  const result = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?q=${encodeURI(text)}`);
  const data = (await result.json()) as FetchLocation.Response;
  return [...data.items];
}

// Loads the options for the async multiselect
export async function getLocationOptions(text: string): Promise<Array<SelectOption<FetchLocation.Location>>> {
  return (await fetchLocation(text)).map(l => formatSelectOption(l.title, l));
}

// Location lookup
export async function lookupLocation(id: string): Promise<LocationLookup.Location> {
  if (!id) throw new Error("NoLocationId");

  const response = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_LOOKUP}?id=${encodeURI(id)}`);
  return await response.json();
}

//

export namespace FetchLocation {
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

//

export namespace LocationLookup {
  export interface Address {
    label: string;
    countryCode: string;
    countryName: string;
    state: string;
  }

  export interface Position {
    lat: number;
    lng: number;
  }

  export interface MapView {
    west: number;
    south: number;
    east: number;
    north: number;
  }

  export interface Location {
    title: string;
    id: string;
    language: string;
    resultType: string;
    administrativeAreaType: string;
    address: Address;
    position: Position;
    mapView: MapView;
  }
}
