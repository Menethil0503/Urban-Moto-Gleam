import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import { Reserva } from "@/src/lib/models/Reserva";
import { exigirSesion } from "@/src/lib/auth-servidor";
import { ESTADOS_RESERVA, type EstadoReserva } from "@/src/lib/reservas";
import { serializarReserva } from "@/src/lib/reservas-json";

export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ id: string }> };

/** PATCH /api/reservas/[id] — cambia el estado de una reserva desde el panel. */
export async function PATCH(request: Request, contexto: Contexto) {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  const { id } = await contexto.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Identificador de reserva inválido." }, { status: 400 });
  }

  let cuerpo: { estado?: string };
  try {
    cuerpo = (await request.json()) as { estado?: string };
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const estado = cuerpo.estado;
  if (!estado || !(ESTADOS_RESERVA as readonly string[]).includes(estado)) {
    return NextResponse.json(
      { error: `Estado inválido. Valores permitidos: ${ESTADOS_RESERVA.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const reserva = await Reserva.findByIdAndUpdate(
      id,
      { estado: estado as EstadoReserva, activa: estado !== "cancelada" },
      { new: true, runValidators: true },
    );

    if (!reserva) {
      return NextResponse.json({ error: "La reserva no existe." }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Estado actualizado.", reserva: serializarReserva(reserva) });
  } catch (error) {
    console.error("[api/reservas/:id] PATCH", error);
    return NextResponse.json({ error: "No se pudo actualizar la reserva." }, { status: 503 });
  }
}

/** DELETE /api/reservas/[id] — elimina una reserva (útil para limpiar demos). */
export async function DELETE(_request: Request, contexto: Contexto) {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  const { id } = await contexto.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Identificador de reserva inválido." }, { status: 400 });
  }

  try {
    await connectDB();

    const reserva = await Reserva.findByIdAndDelete(id);
    if (!reserva) {
      return NextResponse.json({ error: "La reserva no existe." }, { status: 404 });
    }

    return NextResponse.json({ mensaje: "Reserva eliminada." });
  } catch (error) {
    console.error("[api/reservas/:id] DELETE", error);
    return NextResponse.json({ error: "No se pudo eliminar la reserva." }, { status: 503 });
  }
}
