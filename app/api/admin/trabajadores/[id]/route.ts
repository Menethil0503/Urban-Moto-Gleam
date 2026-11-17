import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/src/lib/mongodb";
import { exigirSesion } from "@/src/lib/auth-servidor";
import { Trabajador } from "@/src/lib/models/Trabajador";

export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, contexto: Contexto) {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  const { id } = await contexto.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Identificador de trabajador inválido." }, { status: 400 });
  }

  let cuerpo: { nombre?: string; activo?: boolean };
  try {
    cuerpo = (await request.json()) as { nombre?: string; activo?: boolean };
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const cambios: { nombre?: string; activo?: boolean } = {};
  if (typeof cuerpo.nombre === "string") {
    const nombre = cuerpo.nombre.trim().replace(/\s+/g, " ");
    if (nombre.length < 2 || nombre.length > 80) {
      return NextResponse.json({ error: "El nombre debe tener entre 2 y 80 caracteres." }, { status: 400 });
    }
    cambios.nombre = nombre;
  }
  if (typeof cuerpo.activo === "boolean") cambios.activo = cuerpo.activo;
  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "No se recibieron cambios válidos." }, { status: 400 });
  }

  try {
    await connectDB();
    const trabajador = await Trabajador.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
    if (!trabajador) return NextResponse.json({ error: "El trabajador no existe." }, { status: 404 });
    return NextResponse.json({
      trabajador: { id: trabajador.id, nombre: trabajador.nombre, activo: trabajador.activo },
    });
  } catch (error) {
    console.error("[api/admin/trabajadores/:id] PATCH", error);
    return NextResponse.json({ error: "No se pudo actualizar el trabajador." }, { status: 503 });
  }
}