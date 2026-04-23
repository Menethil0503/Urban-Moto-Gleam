import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Moto Gleam | Lavadero Premium de Motos en Bogotá",
  description:
    "Lavado ecológico, detallado y mantenimiento premium para motos en Bogotá. Brillo urbano con estilo y sostenibilidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
