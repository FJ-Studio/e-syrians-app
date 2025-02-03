import DisarmMap from "@/components/disarm/map/map";
import { DeliveryPoint } from "@/lib/types/weapon-delivery";

const demodata: Array<DeliveryPoint> = [
  {
    id: 1,
    name: "مخفر حلب",
    location: {
      latitude: 36.207267,
      longitude: 37.1408942,
    },
    address: "حلب، الجميلية، شارع حافظ ابراهيم",
  },
  {
    id: 2,
    name: "مخفر القورية",
    location: {
      latitude: 34.965596,
      longitude: 40.2149763,
    },
    address: "دير الزور، القورية قرب دوار السوق",
  },
  {
    id: 2,
    name: "مخفر شرطة الهنادي",
    location: {
      latitude: 35.5114328,
      longitude: 35.8663258,
    },
    address: "اللاذقية، الهنادي، حارة البيدر",
  },
  {
    id: 2,
    name: "مخفر غباغب",
    location: {
      latitude: 33.1819491,
      longitude: 36.2233965,
    },
    address: "درعا غباغب، على الطريق الدولي",
  },
];

export default function DisarmPage() {
  return <DisarmMap points={demodata} />;
}
