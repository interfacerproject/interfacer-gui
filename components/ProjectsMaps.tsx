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
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import { FetchInventoryQuery, FetchInventoryQueryVariables } from "../lib/types";

import { AdjustmentsIcon } from "@heroicons/react/outline";
import cn from "classnames";
import useFilters from "hooks/useFilters";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import ProjectDisplay from "./ProjectDisplay";
import ProjectsFilters from "./ProjectsFilters";

const ProjectsMaps = () => {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  const [cursor, setCursor] = useState<string>("grab");
  const [popUpsAnchors, setPopUpsAnchor] = useState<any>(null);

  const mapRef = useRef<MapRef>(null);

  const { mapFilter: filter } = useFilters();
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

  const { t } = useTranslation("lastUpdatedProps");

  const [showFilter, setShowFilter] = useState(false);
  const toggleFilter = () => setShowFilter(!showFilter);

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

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-5">
          <button
            onClick={toggleFilter}
            className={cn(
              "gap-2 text-white-700 font-normal normal-case rounded-[4px] border-1 btn btn-sm btn-outline border-white-600 bg-white-100 hover:text-accent hover:bg-white-100",
              { "bg-accent text-white-100": showFilter }
            )}
          >
            <AdjustmentsIcon className="w-5 h-5" /> {t("Filter by")}
          </button>
        </div>
        <div className="flex flex-row flex-nowrap items-start space-x-8 w-full">
          <div className="flex flex-col flex-nowrap w-full">
            <Map
              initialViewState={{
                latitude: 53.3,
                longitude: 9.98,
                zoom: 4,
              }}
              interactive
              style={{ width: "full", height: 600 }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
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
          </div>
          {showFilter && (
            <div className="basis-96 sticky top-8">
              <ProjectsFilters hideConformsTo />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectsMaps;
