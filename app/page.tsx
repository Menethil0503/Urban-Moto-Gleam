"use client";

import { Landing } from "@/src/components/Landing";
import data from "@/data.json";
import { useSyncExternalStore } from "react";
import { Providers } from "./providers";

export default function Home() {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return <div className="min-h-screen bg-black" suppressHydrationWarning />;
  }

  return (
    <Providers>
      <Landing data={data} />
    </Providers>
  );
}
