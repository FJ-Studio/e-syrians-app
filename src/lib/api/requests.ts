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
  page: string,
  year: string = '',
  month: string = ''
): Promise<ApiResponse<{polls: Array<Poll>; current_page: number; last_page: number}>> => {
  const session = await auth();
  const req = await fetch(
    `${process.env.API_URL}/polls?page=${page}&year=${year}&month=${month}`,
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
