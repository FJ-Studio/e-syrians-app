import DisarmMap from "@/components/disarm/map/map";
import { DeliveryPoint } from "@/lib/types";

const demodata: Array<DeliveryPoint> = [
    {
        id: 1,
        name: "Aleppo",
        location: {
            latitude: 36.2021,
            longitude: 37.1343,
        },
        address: "Aleppo, Syria",
    },
    {
        id: 2,
        name: "Hama",
        location: {
            latitude: 35.1316,
            longitude: 36.7571,
        },
        address: "Hama, Syria",
    }
]

export default function DisarmPage() {
  return (
      <DisarmMap points={demodata} />
  );
}
