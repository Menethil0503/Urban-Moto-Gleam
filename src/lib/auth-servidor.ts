import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESION, verificarSesion, type SesionAdmin } from "./auth-token";

/** Lee la sesión desde las cookies (solo en Route Handlers / Server Components). */
export async function sesionActual(): Promise<SesionAdmin | null> {
  const almacen = await cookies();
  return verificarSesion(almacen.get(COOKIE_SESION)?.value);
}

/**
 * Devuelve una respuesta 401 si no hay sesión válida, o `null` si la hay.
 * Se usa dentro de los Route Handlers como segunda barrera, además del Proxy.
 */
export async function exigirSesion(): Promise<NextResponse | null> {
  const sesion = await sesionActual();

  if (!sesion) {
    return NextResponse.json(
      { error: "No autorizado. Inicia sesión en el panel." },
      { status: 401 },
    );
  }

  return null;
}
