import { NextResponse } from "next/server";
import { COOKIE_SESION } from "@/src/lib/auth-token";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — elimina la cookie de sesión. */
export async function POST() {
  const respuesta = NextResponse.json({ mensaje: "Sesión cerrada." });
  respuesta.cookies.set(COOKIE_SESION, "", { path: "/", maxAge: 0 });
  return respuesta;
}
