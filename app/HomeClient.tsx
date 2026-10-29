"use client";

import { useSyncExternalStore } from "react";
import type { LandingData } from "@/src/components/sections/types";
import { Landing } from "@/src/components/Landing";
import { Providers } from "./providers";

/**
 * Capa cliente de la home: Chakra UI y GSAP necesitan ejecutarse en el navegador,
 * así que el contenido leído en el servidor se pasa como prop a este componente.
 */
export function HomeClient({ data }: { data: LandingData }) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
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
