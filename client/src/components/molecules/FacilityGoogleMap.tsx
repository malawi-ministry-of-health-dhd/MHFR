import React from "react";
import L from "leaflet";
import { Map, Marker, useLeaflet } from "react-leaflet";
import OpenFreeMapLayer from "../atoms/OpenFreeMapLayer";
import {
  buildOpenStreetMapLocationUrl,
  defaultMarkerIcon
} from "../../services/leaflet";

const mapHeight = `57vh`;

type Props = {
  position: {
    lat: any;
    lng: any;
  };
  isMarkerShown?: boolean;
  rightInset?: number;
};

type OffsetProps = {
  position: {
    lat: any;
    lng: any;
  };
  rightInset: number;
  markerPadding?: number;
};

const MarkerViewportOffset = (props: OffsetProps) => {
  const { map } = useLeaflet();
  const { position, rightInset, markerPadding = 40 } = props;

  React.useEffect(() => {
    if (!map) {
      return;
    }

    const applyOffset = () => {
      const markerLatLng = L.latLng(Number(position.lat), Number(position.lng));
      const mapSize = map.getSize();
      const shiftX = Math.max(
        0,
        rightInset + markerPadding - mapSize.x / 2
      );
      const projectedMarker = map.project(markerLatLng, map.getZoom());
      const adjustedCenter = map.unproject(
        L.point(projectedMarker.x + shiftX, projectedMarker.y),
        map.getZoom()
      );

      map.setView(adjustedCenter, map.getZoom(), { animate: false });
    };

    applyOffset();
    map.on("zoomend", applyOffset);
    map.on("resize", applyOffset);

    return () => {
      map.off("zoomend", applyOffset);
      map.off("resize", applyOffset);
    };
  }, [map, markerPadding, position.lat, position.lng, rightInset]);

  return null;
};

const FacilityGoogleMap = (props: Props) => {
  const { position, isMarkerShown, rightInset = 0 } = props;
  const latitude = Number(position.lat);
  const longitude = Number(position.lng);
  const center = [latitude, longitude];
  const markerPosition = [latitude, longitude];

  return (
    <div
      className="mhfr-map-shell mhfr-map-shell--facility"
      test-id="fgooglemap"
      style={{
        height: mapHeight,
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Map
        attributionControl
        center={center as any}
        className="mhfr-map"
        maxZoom={20}
        minZoom={1}
        zoomControl
        zoom={17}
        scrollWheelZoom={false}
        style={{ height: mapHeight, width: "100%" }}
      >
        <MarkerViewportOffset position={position} rightInset={rightInset} />
        <OpenFreeMapLayer />
        {isMarkerShown && (
          <Marker
            icon={defaultMarkerIcon}
            position={markerPosition as any}
          />
        )}
      </Map>
      <a
        className="mhfr-map-action"
        href={buildOpenStreetMapLocationUrl(position, 17)}
        target="_blank"
        rel="noopener noreferrer"
      >
        View larger map
      </a>
    </div>
  );
};

export default FacilityGoogleMap;
