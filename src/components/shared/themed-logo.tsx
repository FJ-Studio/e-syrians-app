"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { FC, useSyncExternalStore } from "react";

type Props = {
  width: number;
  height: number;
  className?: string;
};

const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

const ThemedLogo: FC<Props> = ({ width, height, className }) => {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getTrue, getFalse);

  const src = mounted && resolvedTheme === "dark" ? "/icon-dark.svg" : "/icon.svg";

  return <Image src={src} alt="Logo" width={width} height={height} className={className} />;
};

export default ThemedLogo;
