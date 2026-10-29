import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { Reserva } from "@/src/lib/models/Reserva";
import {
  CUPOS_POR_DIA,
  HORAS_DISPONIBLES,
  formatoFechaISO,
  parseFechaISO,
  rangoMes,
} from "@/src/lib/reservas";

export const dynamic = "force-dynamic";

/**
 * GET /api/disponibilidad?mes=YYYY-MM&fecha=YYYY-MM-DD
 *
 * Devuelve la ocupación real de la agenda:
 * - `conteoPorDia`: reservas activas por cada día del mes.
 * - `diasCompletos`: días sin cupos disponibles (para deshabilitar en el calendario).
 * - `horasOcupadas`: bloques tomados del día consultado.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  const fechaParam = searchParams.get("fecha");

  const conteoPorDia: Record<string, number> = {};
  const diasCompletos: string[] = [];
  let horasOcupadas: string[] = [];

  try {
    await connectDB();

    // ── Ocupación del mes ──────────────────────────────────────
    if (mes) {
      const rango = rangoMes(mes);
      if (!rango) {
        return NextResponse.json({ error: "El parámetro «mes» debe tener el formato YYYY-MM." }, { status: 400 });
      }

      const reservasDelMes = (await Reserva.find(
        { fecha: { $gte: rango.inicio, $lt: rango.fin }, activa: true },
        { fecha: 1 },
      ).lean()) as unknown as { fecha: Date }[];

      for (const reserva of reservasDelMes) {
        const clave = formatoFechaISO(reserva.fecha);
        conteoPorDia[clave] = (conteoPorDia[clave] ?? 0) + 1;
      }

      for (const [clave, total] of Object.entries(conteoPorDia)) {
        if (total >= CUPOS_POR_DIA) {
          diasCompletos.push(clave);
        }
      }
    }

    // ── Ocupación de un día concreto ───────────────────────────
    if (fechaParam) {
      const fecha = parseFechaISO(fechaParam);
      if (!fecha) {
        return NextResponse.json({ error: "El parámetro «fecha» debe tener el formato YYYY-MM-DD." }, { status: 400 });
      }

      const reservasDelDia = (await Reserva.find({ fecha, activa: true }, { hora: 1 }).lean()) as unknown as {
        hora: string;
      }[];
      horasOcupadas = reservasDelDia.map((reserva) => reserva.hora);
    }

    return NextResponse.json({
      horas: HORAS_DISPONIBLES,
      cuposPorDia: CUPOS_POR_DIA,
      conteoPorDia,
      diasCompletos,
      horasOcupadas,
    });
  } catch (error) {
    console.error("[api/disponibilidad] GET", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disponibilidad. ¿Está MongoDB encendido?" },
      { status: 503 },
    );
  }
}
