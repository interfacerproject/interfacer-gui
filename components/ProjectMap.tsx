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

import Map, { FullscreenControl, Marker, Popup } from "react-map-gl";

import devLog from "lib/devLog";
import { EconomicResource } from "lib/types";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useState } from "react";
import { Text } from "@bbtgnn/polaris-interfacer";

export interface ProjectMapProps {
  project: Partial<EconomicResource>;
  height?: number;
  fixed?: boolean;
}

const ProjectMap = (props: ProjectMapProps) => {
  const { project, height = 600, fixed = false } = props;
  devLog("map", project);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [cursor, setCursor] = useState<string>("grab");
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);
  const onGrab = useCallback(() => setCursor("grabbing"), []);

  const style = fixed ? "mapbox://styles/mapbox/outdoors-v12" : "mapbox://styles/mapbox/satellite-streets-v12";

  return (
    <>
      <Map
        initialViewState={{
          latitude: project.currentLocation?.lat,
          longitude: project.currentLocation?.long,
          zoom: 7,
        }}
        style={{ width: "full", height: height, borderRadius: "0.5rem" }}
        mapStyle={style}
        mapboxAccessToken={MAPBOX_TOKEN}
        dragPan={!fixed}
        scrollZoom={!fixed}
        doubleClickZoom={!fixed}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        cursor={cursor}
        maxZoom={15}
        minZoom={6}
      >
        <Marker longitude={project.currentLocation?.long} latitude={project.currentLocation?.lat} color="red" />
        <Popup
          longitude={project.currentLocation?.long}
          latitude={project.currentLocation?.lat}
          closeButton={false}
          anchor="top"
          closeOnClick={false}
        >
          <Text as="p" variant="bodySm">
            {project.currentLocation?.mappableAddress}
          </Text>
        </Popup>
        {!fixed && <FullscreenControl position="top-right" />}
      </Map>
    </>
  );
};

export default ProjectMap;
