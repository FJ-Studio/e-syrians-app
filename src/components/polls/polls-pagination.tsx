"use client";

import { Pagination } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";

type Props = {
  page: number;
  last_page: number;
};

const PollPagination: FC<Props> = ({ page, last_page }) => {
  const sp = useSearchParams();
  const params = new URLSearchParams(sp.toString());
  const pathname = usePathname();
  const { push } = useRouter();

  return (
    <Pagination
      total={last_page}
      initialPage={page}
      onChange={(p) => {
        params.set("page", p.toString());
        push(`${pathname}?${params.toString()}`);
      }}
    />
  );
};

export default PollPagination;
