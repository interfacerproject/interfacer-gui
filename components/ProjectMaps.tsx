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

import { useQuery } from "@apollo/client";
import Map, { Layer, LayerProps, MapRef, Popup, Source, useMap } from "react-map-gl";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { EconomicResourceFilterParams, FetchInventoryQuery, FetchInventoryQueryVariables } from "../lib/types";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import ProjectDisplay from "./ProjectDisplay";

export interface ProjectsMapsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ProjectsMaps = (props: ProjectsMapsProps) => {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [cursor, setCursor] = useState<string>("grab");
  const mapRef = useRef<MapRef>(null);
  const { filter = {} } = props;
  const { data } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(FETCH_RESOURCES, {
    variables: { last: 200, filter: filter },
  });
  const PopUps = () => {
    const { current: map } = useMap();
    if (!map) return null;
    if (!map.isStyleLoaded()) return null;
    const points = map
      .querySourceFeatures("projects", { sourceLayer: unclusteredPointLayer.id! })
      .filter((e: any) => !e.properties?.cluster);
    return (
      <>
        {points.map((p: any, i) => (
          <Popup
            key={i}
            latitude={p.geometry.coordinates[1]}
            longitude={p.geometry.coordinates[0]}
            closeButton={false}
            closeOnClick={false}
            style={{ width: "400px", padding: 0, overflow: "hidden", maxWidth: "600px" }}
            // offset={locationsFrequency[`${lat}-${long}`] * 5}
          >
            <Link href={`/project/${p.properties.id}`}>
              <a>
                <ProjectDisplay projectId={p.properties.id} />
              </a>
            </Link>
          </Popup>
        ))}
      </>
    );
  };
  const projects = data?.economicResources?.edges;
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);
  const onGrab = useCallback(() => setCursor("grabbing"), []);
  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "earthquakes",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#32D583", 20, "#FDB022", 50, "#FF7A70", 90, "#FF7A70"],
      "circle-radius": ["step", ["get", "point_count"], 20, 60, 30, 80, 100],
    },
  };

  const handleMapClick = (e: any) => {
    e.preventDefault();
    const features = e.features || [];
    if (!features.length) return;
    if (!!features[0]?.properties.cluster_id) {
      const zoom = mapRef.current?.getZoom();
      mapRef.current?.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom! * 1.4,
        duration: 500,
      });
    }
  };
  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "projects",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  };

  const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "projects",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#014837",
      "circle-radius": 10,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  };

  if (!projects) return null;

  const geoJSON = {
    type: "FeatureCollection",
    features: projects?.map(({ node }) => {
      return {
        type: "Feature",
        properties: { id: node.id, title: node.name, long: node.currentLocation?.long, lat: node.currentLocation?.lat },
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
        interactive
        style={{ width: "full", height: 600 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id!, unclusteredPointLayer.id!]}
        onClick={handleMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        ref={mapRef}
        cursor={cursor}
      >
        <Source
          id="projects"
          type="geojson"
          // @ts-ignore
          data={geoJSON}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={15}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
        <PopUps />
      </Map>
    </>
  );
};

export default ProjectsMaps;
