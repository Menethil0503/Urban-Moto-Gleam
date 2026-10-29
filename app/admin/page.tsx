import type { Metadata } from "next";
import { Providers } from "../providers";
import { AdminPanel } from "./AdminPanel";

export const metadata: Metadata = {
  title: "Panel de reservas | Urban Moto Gleam",
  description: "Panel interno para ver y gestionar las citas agendadas.",
};

export default function AdminPage() {
  return (
    <Providers>
      <AdminPanel />
    </Providers>
  );
}
