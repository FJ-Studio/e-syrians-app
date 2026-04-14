"use client";

import { Pagination } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";

type Props = {
  page: number;
  last_page: number;
};

const FeatureRequestsPagination: FC<Props> = ({ page, last_page }) => {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  return (
    <Pagination
      total={last_page}
      initialPage={page}
      onChange={(p) => {
        // Preserve sort/status when paginating.
        const params = new URLSearchParams(sp.toString());
        params.set("page", p.toString());
        push(`${pathname}?${params.toString()}`);
      }}
    />
  );
};

export default FeatureRequestsPagination;
