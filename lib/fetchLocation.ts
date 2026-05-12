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

interface NominatimAddress {
  country?: string;
  country_code?: string;
  state?: string;
}

interface NominatimItem {
  place_id?: number;
  osm_type?: "node" | "way" | "relation";
  osm_id?: number;
  display_name?: string;
  lat?: string;
  lon?: string;
  boundingbox?: [string, string, string, string];
  address?: NominatimAddress;
}

function osmTypePrefix(osmType?: string): "N" | "W" | "R" | "" {
  if (osmType === "node") return "N";
  if (osmType === "way") return "W";
  if (osmType === "relation") return "R";
  return "";
}

function toLocationId(item: NominatimItem): string {
  const prefix = osmTypePrefix(item.osm_type);
  if (prefix && item.osm_id) return `${prefix}${item.osm_id}`;
  if (item.lat && item.lon) {
    const title = encodeURIComponent(item.display_name || "");
    return `COORD:${item.lat},${item.lon}|${title}`;
  }
  return "";
}

function isValidOsmId(id: string): boolean {
  return /^[NWR]\d+$/.test(id);
}

function parseCoordId(id: string): { lat: number; lng: number; title: string } | null {
  if (!id.startsWith("COORD:")) return null;

  const payload = id.slice(6);
  const [coords, encodedTitle = ""] = payload.split("|");
  const [latStr, lngStr] = coords.split(",");
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    title: decodeURIComponent(encodedTitle || ""),
  };
}

function mapSearchItem(item: NominatimItem): FetchLocation.Location {
  const lat = Number(item.lat || 0);
  const lng = Number(item.lon || 0);

  return {
    title: item.display_name || "",
    id: toLocationId(item),
    language: "",
    resultType: item.osm_type || "",
    administrativeAreaType: "",
    address: {
      label: item.display_name || "",
      countryCode: (item.address?.country_code || "").toUpperCase(),
      countryName: item.address?.country || "",
    },
    highlights: {
      title: [],
      address: {
        label: [],
        countryCode: [],
      },
    },
    position: {
      lat,
      lng,
    },
  };
}

function mapLookupItem(item: NominatimItem): LocationLookup.Location {
  const lat = Number(item.lat || 0);
  const lng = Number(item.lon || 0);
  const bbox = item.boundingbox;

  return {
    title: item.display_name || "",
    id: toLocationId(item),
    language: "",
    resultType: item.osm_type || "",
    administrativeAreaType: "",
    address: {
      label: item.display_name || "",
      countryCode: (item.address?.country_code || "").toUpperCase(),
      countryName: item.address?.country || "",
      state: item.address?.state || "",
    },
    position: {
      lat,
      lng,
    },
    mapView: {
      west: bbox ? Number(bbox[2]) : lng,
      south: bbox ? Number(bbox[0]) : lat,
      east: bbox ? Number(bbox[3]) : lng,
      north: bbox ? Number(bbox[1]) : lat,
    },
  };
}

// Fetches the location from the API
export async function fetchLocation(text: string): Promise<Array<FetchLocation.Location>> {
  if (!text) return [];

  try {
    const params = new URLSearchParams({
      q: text,
      format: "jsonv2",
      addressdetails: "1",
      limit: "10",
    });
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?${params.toString()}`);
    const data = (await result.json()) as Array<NominatimItem>;
    return Array.isArray(data) ? data.map(mapSearchItem).filter(item => !!item.id) : [];
  } catch {
    return [];
  }
}

// Loads the options for the async multiselect
export async function getLocationOptions(text: string): Promise<Array<SelectOption<FetchLocation.Location>>> {
  return (await fetchLocation(text)).map(l => formatSelectOption(l.title, l));
}

// Location lookup
export async function lookupLocation(id: string): Promise<LocationLookup.Location | null> {
  if (!id) throw new Error("NoLocationId");

  if (id.startsWith("here:")) return null;
  const coord = parseCoordId(id);
  if (coord) {
    return {
      title: coord.title,
      id,
      language: "",
      resultType: "",
      administrativeAreaType: "",
      address: {
        label: coord.title,
        countryCode: "",
        countryName: "",
        state: "",
      },
      position: {
        lat: coord.lat,
        lng: coord.lng,
      },
      mapView: {
        west: coord.lng,
        south: coord.lat,
        east: coord.lng,
        north: coord.lat,
      },
    };
  }
  if (!isValidOsmId(id)) return null;

  try {
    const params = new URLSearchParams({
      osm_ids: id,
      format: "jsonv2",
      addressdetails: "1",
    });
    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_LOOKUP}?${params.toString()}`);
    const data = (await response.json()) as Array<NominatimItem>;
    if (!Array.isArray(data) || data.length === 0) return null;
    return mapLookupItem(data[0]);
  } catch {
    return null;
  }
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
    position?: {
      lat: number;
      lng: number;
    };
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
