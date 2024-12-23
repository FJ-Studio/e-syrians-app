"use client";
import { MAP_CENTER, MAP_ID, MAP_KEY } from "@/lib/constants";
import { DeliveryPoint } from "@/lib/types";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useLocale, useTranslations } from "next-intl";
import { FC, Suspense, useState } from "react";
import SelectedPoint from "./selected-point";
import { Button } from "@nextui-org/react";
import InfoModal from "./info-modal";

type Props = {
  points: Array<DeliveryPoint>;
};

const DisarmMap: FC<Props> = ({ points }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(
    null
  );
  return (
    <div className="relative h-[calc(100dvh)] w-full">
      {selectedPoint && <SelectedPoint point={selectedPoint} />}
      <div className="z-10 absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 items-center">
        <Button
          className=""
          variant="solid"
          color="primary"
          onPress={() => setSelectedPoint(null)}
        >
          {t("disarm.i_have_weapon")}
        </Button>
        <InfoModal />
      </div>
      <APIProvider apiKey={MAP_KEY} language={locale} libraries={["places"]}>
        <Suspense>
          <Map
            mapId={MAP_ID}
            defaultCenter={MAP_CENTER}
            defaultZoom={7}
            minZoom={7}
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            onClick={() => {
              setSelectedPoint(null);
            }}
          >
            {points.map((point) => (
              <AdvancedMarker
                key={point.id}
                onClick={() => {
                  setSelectedPoint(point);
                }}
                position={{
                  lat: point.location.latitude,
                  lng: point.location.longitude,
                }}
              >
                <Pin
                  background={"#007A3D"}
                  glyphColor={"#FFF"}
                  borderColor={"#007A3D"}
                  scale={selectedPoint?.id === point.id ? 1.25 : 0.85}
                />
              </AdvancedMarker>
            ))}
          </Map>
        </Suspense>
      </APIProvider>
    </div>
  );
};

export default DisarmMap;
