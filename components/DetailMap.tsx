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

import Map, { FullscreenControl, MapRef, Marker, Popup } from "react-map-gl";

import devLog from "lib/devLog";
import { SpatialThing } from "lib/types";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@bbtgnn/polaris-interfacer";

export interface DetailMapProps {
  location: Partial<SpatialThing>;
  height?: number;
}

const DetailMap = (props: DetailMapProps) => {
  const { height = 600, location } = props;
  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string>("grab");
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);
  const onGrab = useCallback(() => setCursor("grabbing"), []);
  // @ts-ignore
  const fullscreen = mapRef.current?.getMap()._controls[2]._fullscreen;
  useEffect(() => {
    setIsFullscreen(fullscreen);
  }, [fullscreen, loaded]);
  const lat = location.lat;
  const long = location.long;
  const mappableAddress = location.mappableAddress;
  const style = "mapbox://styles/mapbox/light-v11";

  return (
    <div className="w-full">
      <Map
        initialViewState={{
          latitude: lat,
          longitude: long,
          zoom: 7,
        }}
        style={{ width: "full", height: height, borderRadius: "0.5rem" }}
        mapStyle={style}
        mapboxAccessToken={MAPBOX_TOKEN}
        dragPan={isFullscreen}
        ref={mapRef}
        scrollZoom={isFullscreen}
        doubleClickZoom={isFullscreen}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onGrab}
        onMouseUp={onMouseLeave}
        onLoad={() => setLoaded(true)}
        cursor={cursor}
        maxZoom={15}
        minZoom={6}
      >
        <Marker longitude={long} latitude={lat} color="red" />
        <Popup longitude={long} latitude={lat} closeButton={false} anchor="top" closeOnClick={false}>
          <Text as="p" variant="bodySm">
            {mappableAddress}
          </Text>
        </Popup>
        <FullscreenControl position="top-right" />
      </Map>
    </div>
  );
};

export default DetailMap;
