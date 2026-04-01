import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export const defaultMarkerIcon = new L.Icon.Default();

export const openFreeMapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";

export const openFreeMapAttribution =
  '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

export const googleLikeMarkerIcon = L.divIcon({
  className: "mhfr-map-pin-wrapper",
  html: '<span class="mhfr-map-pin"><span class="mhfr-map-pin__dot"></span></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34]
});

export const buildOpenStreetMapLocationUrl = (
  position: { lat: number | string; lng: number | string },
  zoom = 15
) =>
  `https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lng}#map=${zoom}/${position.lat}/${position.lng}`;
