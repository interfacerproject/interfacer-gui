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

import Map, { Marker, Popup } from "react-map-gl";

import { useQuery } from "@apollo/client";
import useLoadMore from "../hooks/useLoadMore";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";

import "mapbox-gl/dist/mapbox-gl.css";

export interface ProjectsMapsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ProjectsMaps = (props: ProjectsMapsProps) => {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const { filter = {} } = props;
  const dataQueryIdentifier = "economicResources";
  const { data, fetchMore, refetch, variables } = useQuery<{ data: EconomicResource }>(FETCH_RESOURCES, {
    variables: { last: 200, filter: filter },
  });
  const { items: projects } = useLoadMore({ fetchMore, refetch, variables, data, dataQueryIdentifier });

  return (
    <>
      <Map
        initialViewState={{
          latitude: 53.3,
          longitude: 9.98,
          zoom: 4,
        }}
        style={{ width: "full", height: 600 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {projects?.map(({ node }: { node: EconomicResource }) => (
          <>
            <Marker
              longitude={node.currentLocation?.long || 10}
              latitude={node.currentLocation?.lat || 10}
              color="red"
            />
            <Popup
              longitude={node.currentLocation?.long || 10}
              latitude={node.currentLocation?.lat || 10}
              anchor="bottom"
              onClose={() => {}}
            >
              {node.name}
            </Popup>
          </>
        ))}
      </Map>
    </>
  );
};

export default ProjectsMaps;
