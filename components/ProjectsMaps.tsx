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
import Map, {
  FullscreenControl,
  Layer,
  LayerProps,
  MapRef,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from "react-map-gl";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import {
  EconomicResourceEdge,
  EconomicResourceFilterParams,
  FetchInventoryQuery,
  FetchInventoryQueryVariables,
} from "../lib/types";

import { LocationHazard } from "@carbon/icons-react";
import useFilters from "hooks/useFilters";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import EmptyState from "./EmptyState";
import ProjectDisplay from "./ProjectDisplay";

function groupByCoordinates(arr: mapboxgl.MapboxGeoJSONFeature[]): mapboxgl.MapboxGeoJSONFeature[][] {
  const objGroups = arr.reduce((groups, item) => {
    // @ts-ignore
    const key = `${item.geometry.coordinates[0]}-${item.geometry.coordinates[1]}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    if (!groups[key].find((g: any) => g.properties.id === item.properties?.id)) {
      groups[key].push(item);
    }
    return groups;
  }, {} as Record<string, mapboxgl.MapboxGeoJSONFeature[]>);
  return Object.values(objGroups);
}

const ProjectsMaps = (props: {
  projects?: EconomicResourceEdge[];
  filters?: Partial<EconomicResourceFilterParams>;
}) => {
  const { projects: givenProjects, filters } = props;
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  const [cursor, setCursor] = useState<string>("grab");
  const [popUpsAnchors, setPopUpsAnchor] = useState<any>(null);
  const mapRef = useRef<MapRef>(null);
  const { mapFilter, designId } = useFilters();
  const filter = filters || mapFilter;
  const { data } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(FETCH_RESOURCES, {
    variables: { last: 200, filter: filter },
    skip: Boolean(givenProjects),
  });

  const PopUps = () => {
    const haveOverflows = (p: mapboxgl.MapboxGeoJSONFeature[]) => (p.length > 1 ? "max-h-128 overflow-y-scroll" : "");
    return (
      <>
        {groupByCoordinates(popUpsAnchors)?.map((p: mapboxgl.MapboxGeoJSONFeature[], i: number) => (
          <Popup
            key={i}
            // @ts-ignore
            latitude={p[0].geometry.coordinates[1]}
            // @ts-ignore
            longitude={p[0].geometry.coordinates[0]}
            closeButton={false}
            closeOnClick={false}
            focusAfterOpen={false}
            anchor="left"
          >
            <div className={haveOverflows(p)}>
              <div className="flex flex-col gap-1">
                {p.map((e: any, i: number) => (
                  <Link href={`/project/${e.properties.id}`} key={i}>
                    <a className="m-1 p-1 rounded border hover:cursor-pointer hover:ring-primary hover:fill-primary hover:ring-2">
                      <ProjectDisplay projectId={e.properties.id} />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </Popup>
        ))}
      </>
    );
  };
  const projects = givenProjects || data?.economicResources?.edges.filter(e => e.node.conformsTo?.id !== designId);
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
      "circle-color": { type: "identity", property: "color" },
      "circle-radius": 15,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
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
        zoom: zoom! * 2.2,
        duration: 300,
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
        properties: {
          id: node.id,
          title: node.name,
          color: node.conformsTo?.name === "Product" ? "#FAE5B7" : "#CDE0E4",
        },
        geometry: { type: "Point", coordinates: [node.currentLocation?.long, node.currentLocation?.lat] },
      };
    }),
  };

  if (!geoJSON.features.length)
    return (
      <EmptyState
        description={"No project with location"}
        heading="Nothing to show"
        // @ts-ignore
        icon={<LocationHazard size={60} />}
      />
    );

  return (
    <div className="flex flex-col flex-nowrap w-full">
      <Map
        initialViewState={{
          latitude: 53.3,
          longitude: 9.98,
          zoom: 4,
        }}
        interactive
        style={{ width: "full", height: 600 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
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
        scrollZoom={false}
        touchZoomRotate
      >
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

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
    </div>
  );
};

export default ProjectsMaps;
