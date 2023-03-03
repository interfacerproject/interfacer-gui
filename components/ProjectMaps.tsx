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

import Map, { Layer, LayerProps, Source } from "react-map-gl";

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

  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "earthquakes",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "earthquakes",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  };

  const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "earthquakes",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 10,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  };

  const geoJSON = {
    type: "FeatureCollection",
    features: projects?.map(({ node }: { node: EconomicResource }) => {
      return {
        type: "Feature",
        properties: { id: node.id },
        geometry: { type: "Point", coordinates: [node.currentLocation?.long, node.currentLocation?.lat] },
      };
    }),
  };

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
        <Source
          id="projects"
          type="geojson"
          // @ts-ignore
          data={geoJSON}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
        {/* projects?.map(({ node }: { node: EconomicResource }) => (
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
        )) */}
      </Map>
    </>
  );
};

export default ProjectsMaps;
