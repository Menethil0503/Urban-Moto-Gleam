import { NextResponse } from "next/server";
import { sembrarContenido } from "@/src/lib/seed";
import { exigirSesion } from "@/src/lib/auth-servidor";

export const dynamic = "force-dynamic";

/** POST /api/admin/seed — carga el contenido de `data.json` en MongoDB. */
export async function POST() {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  try {
    const resultado = await sembrarContenido();
    return NextResponse.json({ mensaje: "Contenido sembrado en MongoDB.", ...resultado });
  } catch (error) {
    console.error("[api/admin/seed] POST", error);
    return NextResponse.json(
      { error: "No se pudo sembrar el contenido. ¿Está MongoDB encendido?" },
      { status: 503 },
    );
  }
}
