import { DeliveryPoint } from "@/lib/types";
import { FC } from "react";

type Props = {
    point: DeliveryPoint;
}

const SelectedPoint: FC<Props> = ({ point }) => {
    return (
        <div className="absolute left-2 bottom-2 bg-white p-2 rounded-lg shadow-md z-10">
            <h3 className="font-bold text-red-600">{point.name}</h3>
            <p>{point.address}</p>
        </div>
    )
};

export default SelectedPoint;