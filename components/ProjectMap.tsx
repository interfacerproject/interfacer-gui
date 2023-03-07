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

import Map, { MapRef, Marker, Popup } from "react-map-gl";

import { EconomicResource } from "lib/types";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import ProjectDisplay from "./ProjectDisplay";

export interface ProjectMapProps {
  project: Partial<EconomicResource>;
}

const ProjectMap = (props: ProjectMapProps) => {
  const { project } = props;
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [cursor, setCursor] = useState<string>("grab");
  const mapRef = useRef<MapRef>(null);
  const PopUps = ({ points }: { points: any[] }) => {
    return (
      <>
        {points?.map((p: any, i) => (
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
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);
  const onGrab = useCallback(() => setCursor("grabbing"), []);

  return (
    <>
      <Map
        initialViewState={{
          latitude: project.currentLocation?.lat,
          longitude: project.currentLocation?.long,
          zoom: 7,
        }}
        style={{ width: "full", height: 600 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        cursor={cursor}
        maxZoom={15}
        minZoom={6}
      >
        <Marker longitude={project.currentLocation?.long} latitude={project.currentLocation?.lat} color="red" />
      </Map>
    </>
  );
};

export default ProjectMap;
