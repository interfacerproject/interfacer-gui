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
import Map, { Layer, LayerProps, MapRef, Popup, Source } from "react-map-gl";
import { FETCH_RESOURCES, QUERY_PROJECT_TYPES } from "../lib/QueryAndMutation";
import {
  EconomicResourceFilterParams,
  FetchInventoryQuery,
  FetchInventoryQueryVariables,
  GetProjectTypesQuery,
} from "../lib/types";

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
  const [popUpsAnchors, setPopUpsAnchor] = useState<any>(null);
  const mapRef = useRef<MapRef>(null);

  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);
  const specs = queryProjectTypes.data?.instanceVariables.specs;
  const conformsTo = [specs?.specProjectService.id || "", specs?.specProjectProduct.id || ""];

  const { filter = {} } = props;
  filter.conformsTo = conformsTo;
  const { data } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(FETCH_RESOURCES, {
    variables: { last: 200, filter: filter },
  });
  const PopUps = () => {
    return (
      <>
        {popUpsAnchors?.map((p: any, i: number) => (
          <Popup
            key={i}
            latitude={p.geometry.coordinates[1]}
            longitude={p.geometry.coordinates[0]}
            closeButton={false}
            closeOnClick={false}
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
    source: "projects",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#32D583", 20, "#FDB022", 50, "#FF7A70", 90, "#FF7A70"],
      "circle-radius": ["step", ["get", "point_count"], 20, 60, 30, 80, 100],
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "projects",
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
    source: "projects",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#014837",
      "circle-radius": 10,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  };

  const handleMapClick = (e: any) => {
    if (e.preventDefault) e.preventDefault();
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

  const onZoomChange = () => {
    const points = mapRef?.current
      ?.querySourceFeatures("projects", { sourceLayer: unclusteredPointLayer.id! })
      .filter((e: any) => !e.properties?.cluster);
    setPopUpsAnchor(points);
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
        interactiveLayerIds={[clusterLayer.id!]}
        onClick={handleMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        ref={mapRef}
        cursor={cursor}
        onZoomEnd={onZoomChange}
        onLoad={onZoomChange}
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
        {popUpsAnchors && <PopUps />}
      </Map>
    </>
  );
};

export default ProjectsMaps;
