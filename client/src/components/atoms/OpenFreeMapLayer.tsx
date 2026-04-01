import React from "react";
import L from "leaflet";
import { useLeaflet } from "react-leaflet";
import "@maplibre/maplibre-gl-leaflet";
import {
  openFreeMapAttribution,
  openFreeMapStyleUrl
} from "../../services/leaflet";

type Props = {
  attribution?: string;
  styleUrl?: string;
};

const OpenFreeMapLayer = (props: Props) => {
  const { map, layerContainer } = useLeaflet();

  React.useEffect(() => {
    const layer = (L as any).maplibreGL({
      attribution: props.attribution || openFreeMapAttribution,
      style: props.styleUrl || openFreeMapStyleUrl
    });
    const container = layerContainer || map;

    if (!container) {
      return;
    }

    const containerWithLayerApi = container as any;

    containerWithLayerApi.addLayer(layer);

    return () => {
      containerWithLayerApi.removeLayer(layer);
    };
  }, [layerContainer, map, props.attribution, props.styleUrl]);

  return null;
};

export default OpenFreeMapLayer;
