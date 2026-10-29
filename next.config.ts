import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquetes nativos de servidor: se excluyen del bundling de Next.
  serverExternalPackages: ["mongoose", "whatsapp-web.js"],
};

export default nextConfig;
