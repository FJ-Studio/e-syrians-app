"use client";

import useMounted from "@/components/hooks/use-mounted";
import { useTheme } from "next-themes";
import Image from "next/image";
import { FC } from "react";

type Props = {
  width: number;
  height: number;
  className?: string;
};

const ThemedLogo: FC<Props> = ({ width, height, className }) => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const src = mounted && resolvedTheme === "dark" ? "/icon-dark.svg" : "/icon.svg";

  return <Image src={src} alt="Logo" width={width} height={height} className={className} />;
};

export default ThemedLogo;
