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

import { useQuery } from "lib/apollo-compat";
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
import { useProjectSpecs } from "../hooks/useProjectSpecs";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import {
  EconomicResource,
  EconomicResourceEdge,
  EconomicResourceFilterParams,
  FetchInventoryQuery,
  FetchInventoryQueryVariables,
} from "../lib/types";

import { LocationHazard } from "@carbon/icons-react";
import useFilters from "hooks/useFilters";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useRef, useState } from "react";
import EmptyState from "./EmptyState";
import MapMiniCard from "./MapMiniCard";
import WithFilterLayout from "./layout/WithFilterLayout";

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
  /** Map height in px. Defaults to the catalogue page's 600. */
  height?: number;
  /** Drop the filter toolbar and render the map on its own, for embedding. */
  bare?: boolean;
}) => {
  const { projects: givenProjects, filters, height = 600, bare = false } = props;
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  const [cursor, setCursor] = useState<string>("grab");
  // One popup at a time: the point the user last clicked, and the projects there.
  const [selected, setSelected] = useState<{ lat: number; long: number; ids: string[] } | null>(null);
  const mapRef = useRef<MapRef>(null);
  const { mapFilter, designId } = useFilters();
  const filter = filters || mapFilter;
  const { projectSpecIds } = useProjectSpecs();

  // Only show actual projects (DESIGN, SERVICE, PRODUCT, MACHINE) - exclude DPP and machine resources
  // Use projectSpecIds as fallback, but ensure conformsTo is never an empty array (backend requires at least 1 item)
  const effectiveConformsTo = (filter.conformsTo?.length ? filter.conformsTo : undefined) || projectSpecIds;
  const filterWithProjectTypes: EconomicResourceFilterParams = {
    ...filter,
    conformsTo: effectiveConformsTo.length > 0 ? effectiveConformsTo : undefined,
  };

  const { data } = useQuery<FetchInventoryQuery, FetchInventoryQueryVariables>(FETCH_RESOURCES, {
    variables: { last: 200, filter: filterWithProjectTypes },
    skip: Boolean(givenProjects) || projectSpecIds.length === 0,
  });

  const projects = givenProjects || data?.economicResources?.edges.filter(e => e.node.conformsTo?.id !== designId);

  /** Look a project back up by id, so a popup can render from data we already hold.
      A plain record rather than a `Map`, which react-map-gl's `Map` shadows here. */
  const projectsById: Record<string, EconomicResource> = {};
  for (const { node } of projects ?? []) projectsById[node.id] = node as EconomicResource;

  const SelectedPopUp = () => {
    if (!selected) return null;
    const cards = selected.ids.map(id => projectsById[id]).filter(Boolean);
    if (!cards.length) return null;

    return (
      <Popup
        latitude={selected.lat}
        longitude={selected.long}
        closeButton={false}
        closeOnClick={false}
        focusAfterOpen={false}
        maxWidth="none"
        className="ifr-map-popup"
        onClose={() => setSelected(null)}
      >
        {/* Several projects can share one address; the list scrolls rather than
            growing a popup taller than the map. */}
        <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto">
          {cards.map(project => (
            <MapMiniCard key={project.id} project={project} />
          ))}
        </div>
      </Popup>
    );
  };
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
    // Clicking the map background dismisses whatever popup is open.
    if (!features.length) {
      setSelected(null);
      return;
    }
    if (!!features[0]?.properties.cluster_id) {
      const zoom = mapRef.current?.getZoom();
      setSelected(null);
      mapRef.current?.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom! * 2.2,
        duration: 300,
      });
      return;
    }

    // A single point: open one card for it, or a short list when several
    // projects share the same address.
    const [long, lat] = features[0].geometry.coordinates;
    const ids = groupByCoordinates(features)[0]?.map((f: any) => f.properties.id) ?? [];
    if (ids.length) setSelected({ lat, long, ids });
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

  const map = (
    <div className="flex flex-col flex-nowrap w-full">
      <Map
        initialViewState={{
          latitude: 53.3,
          longitude: 9.98,
          zoom: 4,
        }}
        interactive
        style={{ width: "100%", height }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id!, unclusteredPointLayer.id!]}
        onClick={handleMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        ref={mapRef}
        cursor={cursor}
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
        <SelectedPopUp />
      </Map>
    </div>
  );

  if (bare) return map;

  return <WithFilterLayout hideConformsTo>{map}</WithFilterLayout>;
};

export default ProjectsMaps;
