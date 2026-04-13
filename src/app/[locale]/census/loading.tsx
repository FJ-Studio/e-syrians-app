"use client";
import { Spinner } from "@heroui/react";

export default function CensusLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" color="primary" />
    </div>
  );
}
