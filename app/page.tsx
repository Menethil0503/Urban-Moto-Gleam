import { obtenerContenido } from "@/src/lib/contenido";
import { HomeClient } from "./HomeClient";

// La página depende de datos que cambian (reservas, contenido sembrado), así que
// se renderiza en cada petición en lugar de generarse estáticamente.
export const dynamic = "force-dynamic";

export default async function Home() {
  const contenido = await obtenerContenido();

  return <HomeClient data={contenido} />;
}
