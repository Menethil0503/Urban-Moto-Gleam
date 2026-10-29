import type { Metadata } from "next";
import { Providers } from "../../providers";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso al panel | Urban Moto Gleam",
  description: "Inicia sesión para administrar las reservas del taller.",
  robots: { index: false, follow: false },
};

/** Solo permite volver a rutas del panel: evita redirecciones abiertas. */
function destinoSeguro(valor: string | undefined): string {
  if (valor && valor.startsWith("/admin") && !valor.startsWith("/admin/login")) {
    return valor;
  }
  return "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Providers>
      <LoginForm destino={destinoSeguro(next)} />
    </Providers>
  );
}
