import { DeliveryPoint } from "@/lib/types/weapon-delivery";
import { FC } from "react";

type Props = {
  point: DeliveryPoint;
};

const SelectedPoint: FC<Props> = ({ point }) => {
  return (
    <div className="absolute left-2 bottom-20 sm:bottom-2 bg-white p-2 rounded-lg shadow-md z-10">
      <h3 className="font-bold text-red-600 mb-1">{point.name}</h3>
      <p className="flex items-start gap-1 mb-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>

        <span className="text-xs">{point.address}</span>
      </p>
      <p className="flex items-start gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>

        <span className="text-xs">{point?.description ?? "N/A"}</span>
      </p>
    </div>
  );
};

export default SelectedPoint;
