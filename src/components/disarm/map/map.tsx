"use client";
import mapboxgl from "mapbox-gl";
import { MAP_CENTER, MAP_KEY, MAP_STYLE } from "@/lib/constants/misc";
import { useLocale } from "next-intl";
import { FC, useEffect, useState } from "react";
import SelectedPoint from "./selected-point";
import InfoModal from "./info-modal";
import ReportWeapons from "./report-weapons";

import "mapbox-gl/dist/mapbox-gl.css";
import { DeliveryPoint } from "@/lib/types/weapon-delivery";

if (typeof window !== "undefined") {
  mapboxgl.accessToken = MAP_KEY;
  mapboxgl.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.3.0/mapbox-gl-rtl-text.js",
    null,
    true
  );
}

type Props = {
  points: Array<DeliveryPoint>;
};

const DisarmMap: FC<Props> = ({ points }) => {
  const locale = useLocale();
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(
    null
  );

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map-container",
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: 6,
      style: MAP_STYLE,
      language: locale,
      minZoom: 6,
      boxZoom: true,
    });
    map.addControl(
      new mapboxgl.NavigationControl({
        showZoom: true,
        showCompass: false,
      }),
      "bottom-right"
    );
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );
    points.forEach((markerData) => {
      const marker = new mapboxgl.Marker({
        color: "#007A3D",
        scale: 0.85,
      })
        .setLngLat([
          markerData.location.longitude,
          markerData.location.latitude,
        ])
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        setSelectedPoint(markerData);
      });
    });
    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[calc(100dvh)] w-full">
      {selectedPoint && <SelectedPoint point={selectedPoint} />}
      <div className="z-10 absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 items-center">
        <ReportWeapons />
        <InfoModal />
      </div>
      <div className="w-full h-full" id="map-container"></div>
    </div>
  );
};

export default DisarmMap;
