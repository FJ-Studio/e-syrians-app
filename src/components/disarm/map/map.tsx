import { DeliveryPoint } from "@/lib/types";
import { FC } from "react";

type Props = {
    points: Array<DeliveryPoint>;
};

const DisarmMap: FC<Props> = () => {
    return (
        <div>
            Disarm Map
        </div>
    )
};

export default DisarmMap;