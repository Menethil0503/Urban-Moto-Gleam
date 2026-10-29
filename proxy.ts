import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificarSesion } from "@/src/lib/auth-token";

/**
 * Barrera de acceso al panel de administración (Next.js 16: Proxy = antiguo Middleware).
 *
 * - `/admin/*`  → exige sesión; sin ella redirige a `/admin/login`.
 * - `/admin/login` → si ya hay sesión, redirige al panel.
 * - `/api/admin/*` → exige sesión.
 * - `GET /api/reservas` y `/api/reservas/:id` → exigen sesión (datos personales).
 * - `POST /api/reservas` se deja público: es el formulario de reservas del cliente.
 *
 * Además de esto, cada Route Handler protegido valida la sesión por su cuenta
 * (`exigirSesion`), para no depender únicamente del Proxy.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_SESION)?.value;
  const sesion = await verificarSesion(token);

  const esLogin = pathname === "/admin/login";

  // ── Página de login ──────────────────────────────────────────
  if (esLogin) {
    if (sesion) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── Páginas del panel ────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!sesion) {
      const destino = new URL("/admin/login", request.url);
      destino.searchParams.set("next", pathname + search);
      return NextResponse.redirect(destino);
    }
    return NextResponse.next();
  }

  // ── API ──────────────────────────────────────────────────────
  const esListadoReservas = pathname === "/api/reservas";

  if (esListadoReservas && request.method === "POST") {
    // Formulario público de reservas.
    return NextResponse.next();
  }

  const requiereSesion =
    pathname.startsWith("/api/admin") ||
    esListadoReservas ||
    pathname.startsWith("/api/reservas/");

  if (requiereSesion && !sesion) {
    return NextResponse.json(
      { error: "No autorizado. Inicia sesión en el panel." },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/reservas", "/api/reservas/:path*"],
};
