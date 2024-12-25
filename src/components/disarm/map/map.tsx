"use client";
import mapboxgl from "mapbox-gl";
import { MAP_CENTER, MAP_KEY } from "@/lib/constants";
import { DeliveryPoint } from "@/lib/types";
import { useLocale } from "next-intl";
import { FC, useEffect, useState } from "react";
import SelectedPoint from "./selected-point";
import InfoModal from "./info-modal";
import ReportWeapons from "./report-weapons";

import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
  points: Array<DeliveryPoint>;
};

const DisarmMap: FC<Props> = ({ points }) => {
  const locale = useLocale();
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(
    null
  );

  useEffect(() => {
    mapboxgl.accessToken = MAP_KEY;
    mapboxgl.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.3.0/mapbox-gl-rtl-text.js",
      null,
      true
    );

    const map = new mapboxgl.Map({
      container: "map-container", // container ID
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: 6,
      style: "mapbox://styles/mapbox/light-v11",
      language: locale,
      minZoom: 6,
      boxZoom: true,
    });
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
