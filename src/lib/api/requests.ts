import { auth } from "../../../auth";
import { ESUser } from "../types/account";
import { ApiResponse } from "../types/misc";
import { Poll } from "../types/polls";

export const getPoll = async (id: string): Promise<ApiResponse<Poll>> => {
  const session = await auth();
  const req = await fetch(`${process.env.API_URL}/polls/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    next: {
      revalidate: 120,
    },
    cache: "force-cache",
  });
  return req.json();
};

export const getPolls = async (
  year: string,
  month: string
): Promise<ApiResponse<Array<Poll>>> => {
  const session = await auth();
  const req = await fetch(
    `${process.env.API_URL}/polls?year=${year}&month=${month}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      next: {
        revalidate: 120,
      },
      cache: "force-cache",
    }
  );
  return req.json();
};

export const getFirstRegistrants = async (): Promise<
  ApiResponse<Array<ESUser>>
> => {
  const req = await fetch(`${process.env.API_URL}/users/first`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
    },
    cache: "force-cache",
  });
  return req.json();
};

export const getUser = async (uuid: string): Promise<ApiResponse<ESUser>> => {
  const req = await fetch(`${process.env.API_URL}/users/verify/${uuid}`, {
    next: {
      revalidate: 3600,
    },
    cache: "force-cache",
  });
  return req.json();
};
