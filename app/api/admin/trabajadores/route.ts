import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { exigirSesion } from "@/src/lib/auth-servidor";
import { Trabajador } from "@/src/lib/models/Trabajador";

export const dynamic = "force-dynamic";

export async function GET() {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  try {
    await connectDB();
    const trabajadores = await Trabajador.find().sort({ nombre: 1 }).lean();
    return NextResponse.json({
      trabajadores: trabajadores.map((trabajador) => ({
        id: trabajador._id.toString(),
        nombre: trabajador.nombre,
        activo: trabajador.activo,
      })),
    });
  } catch (error) {
    console.error("[api/admin/trabajadores] GET", error);
    return NextResponse.json({ error: "No se pudieron consultar los trabajadores." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const sinSesion = await exigirSesion();
  if (sinSesion) return sinSesion;

  let cuerpo: { nombre?: string };
  try {
    cuerpo = (await request.json()) as { nombre?: string };
  } catch {
    return NextResponse.json({ error: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const nombre = (cuerpo.nombre ?? "").trim().replace(/\s+/g, " ");
  if (nombre.length < 2 || nombre.length > 80) {
    return NextResponse.json({ error: "El nombre debe tener entre 2 y 80 caracteres." }, { status: 400 });
  }

  try {
    await connectDB();
    const trabajador = await Trabajador.create({ nombre, activo: true });
    return NextResponse.json(
      { trabajador: { id: trabajador.id, nombre: trabajador.nombre, activo: trabajador.activo } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/admin/trabajadores] POST", error);
    return NextResponse.json({ error: "No se pudo registrar el trabajador." }, { status: 503 });
  }
}