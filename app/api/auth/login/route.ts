import { NextResponse } from "next/server";
import { COOKIE_SESION, firmarSesion, opcionesCookie } from "@/src/lib/auth-token";
import { usuariosIguales, verificarContrasena } from "@/src/lib/auth-password";
import { limpiarIntentos, registrarFallo, revisarLimite } from "@/src/lib/rate-limit";

export const dynamic = "force-dynamic";

type CuerpoLogin = {
  usuario?: string;
  contrasena?: string;
};

function ipDeLaPeticion(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || "local";
}

/** POST /api/auth/login — valida credenciales y crea la cookie de sesión. */
export async function POST(request: Request) {
  const clave = ipDeLaPeticion(request);
  const limite = revisarLimite(clave);

  if (!limite.permitido) {
    return NextResponse.json(
      {
        error: `Demasiados intentos fallidos. Espera ${Math.ceil(limite.esperaSegundos / 60)} minuto(s).`,
      },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } },
    );
  }

  let cuerpo: CuerpoLogin;
  try {
    cuerpo = (await request.json()) as CuerpoLogin;
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const usuario = (cuerpo.usuario ?? "").trim();
  const contrasena = cuerpo.contrasena ?? "";

  if (!usuario || !contrasena) {
    return NextResponse.json(
      { error: "Debes escribir usuario y contraseña." },
      { status: 400 },
    );
  }

  const usuarioEsperado = process.env.ADMIN_USUARIO?.trim();
  const hashEsperado = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!usuarioEsperado || !hashEsperado) {
    console.error("[auth] Faltan ADMIN_USUARIO o ADMIN_PASSWORD_HASH en .env.local");
    return NextResponse.json(
      { error: "El panel no está configurado. Revisa .env.local." },
      { status: 500 },
    );
  }

  // Se evalúan ambas condiciones siempre para no revelar cuál falló.
  const usuarioValido = usuariosIguales(usuario.toLowerCase(), usuarioEsperado.toLowerCase());
  const contrasenaValida = verificarContrasena(contrasena, hashEsperado);
  const credencialesCorrectas = usuarioValido && contrasenaValida;

  if (!credencialesCorrectas) {
    registrarFallo(clave);
    const restantes = Math.max(0, limite.intentosRestantes - 1);

    return NextResponse.json(
      {
        error:
          restantes > 0
            ? `Usuario o contraseña incorrectos. Te quedan ${restantes} intento(s).`
            : "Usuario o contraseña incorrectos. La cuenta quedó bloqueada por 15 minutos.",
      },
      { status: 401 },
    );
  }

  limpiarIntentos(clave);

  const respuesta = NextResponse.json({ mensaje: "Sesión iniciada.", usuario: usuarioEsperado });
  respuesta.cookies.set(COOKIE_SESION, await firmarSesion(usuarioEsperado), opcionesCookie);

  return respuesta;
}
