import React from "react";
import { Map, Marker } from "react-leaflet";
import OpenFreeMapLayer from "../../atoms/OpenFreeMapLayer";
import {
  buildOpenStreetMapLocationUrl,
  defaultMarkerIcon,
} from "../../../services/leaflet";

const mapHeight = `57vh`;

type Props = {
  position: {
    lat: any;
    lng: any;
  };
  isMarkerShown?: boolean;
  onLocationClick: Function;
};

const LocationPickerMap = (props: Props) => {
  const { position, isMarkerShown, onLocationClick } = props;
  const latitude = Number(position.lat);
  const longitude = Number(position.lng);
  const center = [latitude, longitude];

  return (
    <div
      className="mhfr-map-shell mhfr-map-shell--picker"
      test-id="fgooglemap"
      style={{
        height: mapHeight,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Map
        attributionControl
        center={center as any}
        className="mhfr-map"
        maxZoom={19}
        minZoom={1}
        zoomControl
        zoom={6.5}
        style={{ height: mapHeight, width: "100%" }}
        onclick={(event) =>
          onLocationClick({
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          })
        }
      >
        <OpenFreeMapLayer />
        {isMarkerShown && (
          <Marker icon={defaultMarkerIcon} position={center as any} />
        )}
      </Map>
      <a
        className="mhfr-map-action"
        href={buildOpenStreetMapLocationUrl(position, 6)}
        target="_blank"
        rel="noopener noreferrer"
      >
        View larger map
      </a>
    </div>
  );
};

export default LocationPickerMap;
