import { ESUser } from "../types/account";
import { ApiResponse } from "../types/misc";

export const getUser = async (uuid: string): Promise<ApiResponse<ESUser>> => {
    const req = await fetch(
        `${process.env.API_URL}/users/verify/${uuid}`,
        {
        next: {
            revalidate: 3600,
        },
        cache: "force-cache",
        }
    );
    return req.json();
};
